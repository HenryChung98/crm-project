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

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  image: string;
  created_at: string;
  email_confirmed_at: string;
  last_sign_in_at: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  supabase: ReturnType<typeof createClient>;
  refetchUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 상태만 전역으로 관리하는 Context Provider
 * 앱의 최상위에서 감싸서 사용
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const refetchUser = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      try {
        const profile = await loadUserProfile(data.session.user);
        setUser(profile);
      } catch (err) {
        console.error("Failed to refetch profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [supabase]);
  /**
   * Supabase 인증 상태 변경을 처리하는 콜백 함수
   * SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, INITIAL_SESSION 이벤트를 처리
   */
  const handleAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      setLoading(true);
      console.log("Auth state changed:", event);
      if (session?.user) {
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
    },

    []
  );

  // Supabase 인증 상태 변경 리스너 등록 및 정리
  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        try {
          const profile = await loadUserProfile(data.session.user);
          setUser(profile);
        } catch (err) {
          console.error("Failed to load initial profile:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, supabase.auth]);

  // Context에 제공할 값들을 메모이제이션하여 불필요한 리렌더링 방지
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

/**
 * AuthContext를 사용하는 커스텀 훅
 * Provider 외부에서 사용할 경우 에러를 던짐
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
