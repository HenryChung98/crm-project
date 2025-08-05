"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export const useSupabase = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  type AuthUser = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    image: string;
    created_at: string;
    email_confirmed_at: string;
    last_sign_in_at: string | null;
  };

  const mapToUserProfile = (sessionUser: User): AuthUser => ({
    id: sessionUser.id,
    email: sessionUser.email ?? "",
    first_name: sessionUser.user_metadata?.first_name ?? "",
    last_name: sessionUser.user_metadata?.last_name ?? "",
    image: sessionUser.user_metadata?.image ?? "",
    created_at: sessionUser.created_at,
    email_confirmed_at: sessionUser.email_confirmed_at ?? "",
    last_sign_in_at: sessionUser.last_sign_in_at ?? null,
  });

  const loadUserProfile = useCallback(async (sessionUser: User): Promise<AuthUser> => {
    return mapToUserProfile(sessionUser);
  }, []);

  const handleAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      console.log("Auth state changed:", event);

      switch (event) {
        case "SIGNED_OUT":
          setUser(null);
          setLoading(false);
          break;

        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "INITIAL_SESSION":
          if (session?.user) {
            setLoading(true);
            try {
              const profile = await loadUserProfile(session.user);
              setUser(profile);
            } catch (err) {
              console.error("Failed to load profile on auth change:", err);
              setUser(null);
            } finally {
              setLoading(false);
            }
          } else {
            setUser(null);
            setLoading(false);
          }
          break;

        default:
          break;
      }
    },
    [loadUserProfile]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, supabase.auth]);

  const setSession = useCallback(
    async (access_token: string, refresh_token: string) => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

        if (error) {
          console.error("Failed to set session:", error.message);
          return false;
        }

        if (data.session?.user) {
          const profile = await loadUserProfile(data.session.user);
          setUser(profile);
        }

        return true;
      } catch (err) {
        console.error("setSession error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase.auth, loadUserProfile]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        return false;
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("signOut exception:", err);
      return false;
    }
  }, [supabase.auth]);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Failed to refresh session:", error.message);
        return false;
      }

      if (data.session?.user) {
        const profile = await loadUserProfile(data.session.user);
        setUser(profile);
      } else {
        setUser(null);
      }

      return true;
    } catch (err) {
      console.error("refreshSession error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase.auth, loadUserProfile]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    supabase,
    setSession,
    signOut,
    refreshSession,
  };
};
