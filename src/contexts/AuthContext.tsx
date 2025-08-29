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
  const supabase = useMemo(() => createClient(), []);

  // 세션 처리 로직을 하나로 통합
  const handleSession = useCallback(async (session: Session | null) => {
    setLoading(true);

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
    const { data } = await supabase.auth.getSession();
    await handleSession(data.session);
  }, [supabase, handleSession]);

  // 인증 상태 변경 핸들러
  const handleAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      await handleSession(session);
    },
    [handleSession]
  );

  // 초기 세션 로드 및 상태 변경 리스너 등록
  useEffect(() => {
    // 초기 세션 로드
    refetchUser();

    // 상태 변경 리스너 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, supabase.auth, refetchUser]);

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
