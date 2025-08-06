import type { User } from "@supabase/supabase-js";

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

export const mapToUserProfile = (sessionUser: User): AuthUser => ({
  id: sessionUser.id,
  email: sessionUser.email ?? "",
  first_name: sessionUser.user_metadata?.first_name ?? "",
  last_name: sessionUser.user_metadata?.last_name ?? "",
  image: sessionUser.user_metadata?.image ?? "",
  created_at: sessionUser.created_at,
  email_confirmed_at: sessionUser.email_confirmed_at ?? "",
  last_sign_in_at: sessionUser.last_sign_in_at ?? null,
});

export const loadUserProfile = async (sessionUser: User): Promise<AuthUser> => {
  return mapToUserProfile(sessionUser);
};
