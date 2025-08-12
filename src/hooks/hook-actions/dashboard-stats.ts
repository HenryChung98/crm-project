"use server";

import { createClient } from "@/utils/supabase/server";

export interface DashboardStats {
  total: number;
  new: number;
  active: number;
}

export async function getDashboardStats(organizationId: string): Promise<DashboardStats | null> {
  if (!organizationId) return null;

  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  // 조직 멤버십 확인
  const { data: memberCheck, error: memberError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .single();

  if (memberError || !memberCheck) {
    throw new Error("Access denied: Not a member of the organization");
  }

  // 병렬로 모든 통계 조회
  const [totalResult, newResult, activeResult] = await Promise.all([
    // 전체 고객 수
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),

    // 신규 고객 수 (최근 30일)
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

    // 활성 고객 수
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  // 에러 확인
  if (totalResult.error) throw totalResult.error;
  if (newResult.error) throw newResult.error;
  if (activeResult.error) throw activeResult.error;

  return {
    total: totalResult.count || 0,
    new: newResult.count || 0,
    active: activeResult.count || 0,
  };
}
