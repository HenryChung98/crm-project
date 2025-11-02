"use server";

import { withOrgAuth } from "../../../../../utils/auth";

export interface DashboardStatsType {
  totalCustomerNum: number;
  newCustomerNum: number;
  leadNum: number;
  customerNum: number;
  instagramCustomerNum: number;
  facebookCustomerNum: number;
  memberCustomerNum: number;
  visitFromInstagramNum: number;
  visitFromFacebookNum: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsType | null> {
  if (!orgId) return null;

  const { supabase } = await withOrgAuth(orgId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // 2개의 쿼리로 축소
  const [customersResult, visitsResult] = await Promise.all([
    supabase.from("customers").select("status, source, created_at").eq("organization_id", orgId),

    supabase.from("visit_logs").select("source").eq("organization_id", orgId),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (visitsResult.error) throw visitsResult.error;

  const customers = customersResult.data || [];
  const visits = visitsResult.data || [];

  // 메모리에서 집계
  return {
    totalCustomerNum: customers.length,
    newCustomerNum: customers.filter((c) => c.created_at >= thirtyDaysAgo).length,
    leadNum: customers.filter((c) => c.status === "lead").length,
    customerNum: customers.filter((c) => c.status === "customer").length,
    instagramCustomerNum: customers.filter((c) => c.source === "instagram Public Lead Form").length,
    facebookCustomerNum: customers.filter((c) => c.source === "facebook Public Lead Form").length,
    memberCustomerNum: customers.filter((c) => c.source?.includes("@")).length,
    visitFromInstagramNum: visits.filter((v) => v.source === "instagram").length,
    visitFromFacebookNum: visits.filter((v) => v.source === "facebook").length,
  };
}
