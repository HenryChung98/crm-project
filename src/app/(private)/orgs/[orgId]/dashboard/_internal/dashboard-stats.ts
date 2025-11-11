"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";

export interface DashboardStatsType {
  totalCustomer: number;
  newCustomer: number;
  lead: number;
  customer: number;
  instagramCustomer: number;
  facebookCustomer: number;
  memberCustomer: number;
  visitTotal: number;
  visitFromInstagram: number;
  visitFromFacebook: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsType | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

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
    totalCustomer: customers.length,
    newCustomer: customers.filter((c) => c.created_at >= thirtyDaysAgo).length,
    lead: customers.filter((c) => c.status === "lead").length,
    customer: customers.filter((c) => c.status === "customer").length,
    instagramCustomer: customers.filter((c) => c.source === "instagram Public Lead Form").length,
    facebookCustomer: customers.filter((c) => c.source === "facebook Public Lead Form").length,
    memberCustomer: customers.filter((c) => c.source?.includes("@")).length,
    visitTotal: visits.length,
    visitFromInstagram: visits.filter((v) => v.source === "instagram").length,
    visitFromFacebook: visits.filter((v) => v.source === "facebook").length,
  };
}
