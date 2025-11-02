"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export const useSupabase = () => {
  const [loading, setLoading] = useState(true);
  const { supabase } = useAuth();
  const router = useRouter();

  // sign out hook
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
    signOut,
    refreshSession,
  };
};
