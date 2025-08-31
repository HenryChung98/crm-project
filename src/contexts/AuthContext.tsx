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
import { createClient } from "@/utils/supabase/client";
import { loadUserProfile } from "@/utils/auth";
import { AuthUserType } from "@/types/authuser";

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
  const [initialized, setInitialized] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // 세션 처리 로직을 하나로 통합
  const handleSession = useCallback(
    async (session: Session | null) => {
      if (!initialized) setLoading(true);

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
      if (!initialized) setInitialized(true);
    },
    [initialized]
  );

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

  // 초기 세션 로드 및 상태 변경 리스너 등록
  useEffect(() => {
    let mounted = true;

    // 상태 변경 리스너 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      // 초기 세션은 별도로 처리하므로 INITIAL_SESSION 이벤트는 스킵
      if (event === "INITIAL_SESSION") {
        await handleSession(session);
      } else {
        await handleSession(session);
      }
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
