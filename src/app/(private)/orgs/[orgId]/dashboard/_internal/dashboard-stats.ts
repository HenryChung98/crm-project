"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";

export interface DashboardStatsType {
  totalCustomer: number;
  newCustomer: number;
  lead: number;
  customerFromLead: number;

  customerFromInstagram: number;
  customerFromFacebook: number;
  customerFromMember: number;

  visitTotal: number;
  visitFromInstagram: number;
  visitFromFacebook: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsType | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [customersResult, visitsResult] = await Promise.all([
    supabase.from("customers").select("status, source, created_at").eq("organization_id", orgId),
    supabase.from("visit_logs").select("source, visited_at").eq("organization_id", orgId),
  ]);

  if (customersResult.error) throw customersResult.error;
  if (visitsResult.error) throw visitsResult.error;

  const customers = customersResult.data || [];
  const visits = visitsResult.data || [];
  const customersLastThirtyDays = customers.filter((c) => c.created_at >= thirtyDaysAgo);
  const visitsLastThirtyDays = visits.filter((v) => v.visited_at >= thirtyDaysAgo);

  // aggregate from memory
  return {
    totalCustomer: customers.length,
    newCustomer: customersLastThirtyDays.length,
    lead: customers.filter((c) => c.status === "lead").length,
    customerFromLead: customers.filter((c) => c.status === "customer").length,

    customerFromInstagram: customers.filter((c) => c.source === "instagram Public Lead Form")
      .length,
    customerFromFacebook: customers.filter((c) => c.source === "facebook Public Lead Form").length,
    customerFromMember: customers.filter((c) => c.source?.includes("@")).length,

    visitTotal: visits.length,
    visitFromInstagram: visits.filter((v) => v.source === "instagram").length,
    visitFromFacebook: visits.filter((v) => v.source === "facebook").length,
  };
}
