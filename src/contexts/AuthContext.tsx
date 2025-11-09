"use client";
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import type { Session, AuthChangeEvent, User } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import { AuthUserType } from "../types/authuser";

// context type
interface AuthContextType {
  user: AuthUserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  supabase: ReturnType<typeof createClient>;
}

// Maps the complex Supabase 'User' object to the simplified 'AuthUserType' used in the app.
const mapToUserProfile = (sessionUser: User): AuthUserType => ({
  id: sessionUser.id,
  email: sessionUser.email ?? "",
  first_name: sessionUser.user_metadata?.first_name ?? "",
  last_name: sessionUser.user_metadata?.last_name ?? "",
  image: sessionUser.user_metadata?.image ?? "",
  created_at: sessionUser.created_at,
  email_confirmed_at: sessionUser.email_confirmed_at ?? "",
  last_sign_in_at: sessionUser.last_sign_in_at ?? null,
});

const loadUserProfile = async (sessionUser: User): Promise<AuthUserType> => {
  return mapToUserProfile(sessionUser);
};

// create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    user: AuthUserType | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });
  const supabase = useMemo(() => createClient(), []);

  // Process authentication session and update user state
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const profile = await loadUserProfile(session.user);
        setAuthState({ user: profile, loading: false });
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setAuthState({ user: null, loading: false });
      }
    } else {
      setAuthState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    // Track component mount state to prevent state updates after unmount
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
      user: authState.user,
      loading: authState.loading,
      isAuthenticated: !!authState.user,
      supabase,
    }),
    [authState, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// { user, loading, isAuthenticated, supabase }
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
