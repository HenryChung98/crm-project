"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { loadUserProfile } from "../utils/auth";
import { AuthUserType } from "../types/authuser";

interface AuthContextType {
  user: AuthUserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  supabase: ReturnType<typeof createClient>;
  refetchUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUserType | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const profile = await loadUserProfile(session.user);
        setUser(profile);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const refetchUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      await handleSession(data.session);
    } catch (error) {
      console.error("Error refetching user:", error);
      setUser(null);
      setLoading(false);
    }
  }, [supabase.auth, handleSession]);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      await handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession, supabase.auth]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      supabase,
      refetchUser,
    }),
    [user, loading, supabase, refetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
