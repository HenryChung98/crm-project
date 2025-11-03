"use server";

import { createClient } from "../../shared-utils/supabase/server";
import { OrganizationMembers } from "../../types/database/organizations";
import { SupabaseError } from "../../types/errors";

export async function getUserOrganizations(select?: string): Promise<OrganizationMembers[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  const { data, error } = (await supabase
    .from("organization_members")
    .select(select || "*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as {
    data: OrganizationMembers[] | null;
    error: SupabaseError;
  };

  if (error) throw error;
  return data || [];
}

export async function getAdminOrganizations(
  orgId: string,
  requiredRoles: ("owner" | "admin")[],
  select = "*"
): Promise<OrganizationMembers[]> {
  if (!orgId || requiredRoles.length === 0) {
    throw new Error("Organization ID and required roles are required");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  // 사용자의 권한 확인 - 여러 역할 중 하나라도 일치하는지 확인
  const { data: adminCheck, error: adminError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .in("role", requiredRoles)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!adminCheck) {
    throw new Error(`${requiredRoles.join(" or ")} permission required`);
  }

  // 조직의 모든 멤버 조회
  const { data: members, error: membersError } = (await supabase
    .from("organization_members")
    .select(select)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })) as {
    data: OrganizationMembers[] | null;
    error: SupabaseError;
  };

  if (membersError) throw membersError;
  return members || [];
}
