"use client";

import { supabase } from "@/lib/supabase";
import { useState, useCallback, useEffect, useRef } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type AuthUser = Database["public"]["Tables"]["auth_users"]["Row"];

export const useSupabase = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingSession = useRef(false);

  const getSession = useCallback(async () => {
    if (fetchingSession.current) return;
    fetchingSession.current = true;
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setUser(null);
        return;
      }

      const { id, email, user_metadata } = session.user;

      setUser({
        id,
        email: email ?? "",
        first_name: user_metadata?.first_name ?? "",
        last_name: user_metadata?.last_name ?? "",
        image: user_metadata?.image ?? "",
        created_at: new Date().toISOString(),
        last_sign_in_at: user_metadata?.last_sign_in_at ?? "",
        email_confirmed_at: user_metadata?.email_confirmed_at ?? "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("getSession error:", error.message);
      } else {
        console.error("getSession error:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSession();

    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const { id, email, user_metadata } = session.user;

          setUser({
            id,
            email: email ?? "",
            first_name: user_metadata?.first_name ?? "",
            last_name: user_metadata?.last_name ?? "",
            image: user_metadata?.image ?? "",
            created_at: new Date().toISOString(),
            last_sign_in_at: user_metadata?.last_sign_in_at ?? "",
            email_confirmed_at: user_metadata?.email_confirmed_at ?? "",
          });
        }
      }
    );

    return () => {
      data?.subscription?.unsubscribe?.(); // ✅ prevent memory leak
    };
  }, [getSession]);

  const setSession = useCallback(
    async (access_token: string, refresh_token: string) => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error("failed to set session:", error.message);
          return false;
        }
        await getSession();
        return true;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("session exception:", error.message);
        } else {
          console.error("session exception:", error);
        }
        return false;
      }
    },
    [getSession]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Failed to sign out:", error.message);
        return false;
      }
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("signOut exception:", error.message);
      } else {
        console.error("signOut exception:", error);
      }
      return false;
    }
  }, []);

  return {
    user,
    loading,
    getSession,
    setSession,
    signOut,
    isAuthenticated: !!user,
  };
};
