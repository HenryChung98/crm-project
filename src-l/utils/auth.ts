import type { User } from "@supabase/supabase-js";
import { AuthUserType } from "../types/authuser";
import { createClient } from "./supabase/server";
import { OrganizationMembers } from "../types/database/organizations";

export interface AuthContext {
  user: User;
  orgMember: OrganizationMembers;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export const mapToUserProfile = (sessionUser: User): AuthUserType => ({
  id: sessionUser.id,
  email: sessionUser.email ?? "",
  first_name: sessionUser.user_metadata?.first_name ?? "",
  last_name: sessionUser.user_metadata?.last_name ?? "",
  image: sessionUser.user_metadata?.image ?? "",
  created_at: sessionUser.created_at,
  email_confirmed_at: sessionUser.email_confirmed_at ?? "",
  last_sign_in_at: sessionUser.last_sign_in_at ?? null,
});

export const loadUserProfile = async (sessionUser: User): Promise<AuthUserType> => {
  return mapToUserProfile(sessionUser);
};

export async function withOrgAuth(
  orgId: string | undefined,
  requiredRoles?: string[]
): Promise<AuthContext> {
  if (!orgId || typeof orgId !== "string" || orgId.trim() === "") {
    throw new Error("Valid organization ID is required");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get user:", userError?.message);
    throw new Error("Unauthorized");
  }

  const { data: orgMember, error: orgError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (orgError) {
    if (orgError.code === "PGRST116") {
      // No rows found - not a member or inactive member
      throw new Error("Access denied: Not a member of the organization");
    } else {
      console.error("Database error during org access check:", orgError);
      throw new Error(`Database error: ${orgError.message}`);
    }
  }

  if (!orgMember) {
    throw new Error("Access denied: Not a member of the organization");
  }

  // 역할 기반 권한 확인
  if (requiredRoles && !requiredRoles.includes(orgMember.role)) {
    throw new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`);
  }

  return { user, orgMember, supabase };
}
