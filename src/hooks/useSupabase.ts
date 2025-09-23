"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const { supabase } = useAuth();
  const router = useRouter();

  const setSession = useCallback(
    async (access_token: string, refresh_token: string) => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });

        if (error) {
          console.error("Failed to set session:", error.message);
          return false;
        }

        return true;
      } catch (err) {
        console.error("setSession error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase.auth]
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
  }, [supabase.auth, router]);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Failed to refresh session:", error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("refreshSession error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  return {
    loading,
    setSession,
    signOut,
    refreshSession,
  };
};
