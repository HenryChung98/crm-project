"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { SupabaseError } from "@/types/errors";

type OrgMember = Database["public"]["Tables"]["organization_members"]["Row"];

// 사용자가 속한 모든 조직 멤버십 조회 (네비바의 조직 목록용)
export async function getAllOrganizationMembers(select?: string): Promise<OrgMember[]> {
  const supabase = await createClient();

  // 사용자 인증 확인
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
    data: OrgMember[] | null;
    error: SupabaseError;
  };

  if (error) throw error;
  return data || [];
}

// 관리자 권한이 필요한 조직 멤버 목록 조회
export async function getAdminOrganizationMembers(
  orgId: string,
  requiredRoles: ("owner" | "admin")[],
  select = "*"
): Promise<OrgMember[]> {
  if (!orgId || requiredRoles.length === 0) {
    throw new Error("Organization ID and required roles are required");
  }

  const supabase = await createClient();

  // 사용자 인증 확인
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
    data: OrgMember[] | null;
    error: SupabaseError;
  };

  if (membersError) throw membersError;
  return members || [];
}
