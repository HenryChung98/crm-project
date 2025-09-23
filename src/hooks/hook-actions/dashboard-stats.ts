"use server";

import { withOrgAuth } from "@/utils/auth";
export interface DashboardStats {
  total: number;
  new: number;
  active: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats | null> {
  if (!orgId) return null;

  const { supabase } = await withOrgAuth(orgId);

  // 병렬로 모든 통계 조회
  const [totalResult, newResult, activeResult] = await Promise.all([
    // 전체 고객 수
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),

    // 신규 고객 수 (최근 30일)
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

    // 활성 고객 수
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
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
