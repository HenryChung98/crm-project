"use server";

import { withOrgAuth } from "@/utils/auth";

export interface DashboardStatsType {
  totalCustomerNum: number;
  newCustomerNum: number;
  leadNum: number;
  customerNum: number;
  instaCustomerNum: number;
  facebookCustomerNum: number;
  memberCustomerNum: number;
  visitWebsiteNum: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsType | null> {
  if (!orgId) return null;

  const { supabase } = await withOrgAuth(orgId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalCustomerNum, error: totalError },
    { count: newCustomerNum, error: newError },
    { count: leadNum, error: leadError },
    { count: customerNum, error: customerError },
    { count: instaCustomerNum, error: instaError },
    { count: facebookCustomerNum, error: facebookError },
    { count: memberCustomerNum, error: memberError },
    { count: visitWebsiteNum, error: visitError },
  ] = await Promise.all([
    // total customer num
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),

    // new customer num (last 30 days)
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", thirtyDaysAgo),

    // lead num
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "lead"),

    // customer num (switched from lead)
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "customer"),

    // customers from instagram
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("source", "instagram Public Lead Form"),

    // customers from facebook
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("source", "facebook Public Lead Form"),

    // customer by member
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .like("source", "%@%"),

    // visited num
    supabase
      .from("visit_logs")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("source", "instagram"),
  ]);

  const errors = [
    totalError,
    newError,
    leadError,
    customerError,
    instaError,
    facebookError,
    memberError,
    visitError,
  ];
  const firstError = errors.find((e) => e);
  if (firstError) throw firstError;

  return {
    totalCustomerNum: totalCustomerNum || 0,
    newCustomerNum: newCustomerNum || 0,
    leadNum: leadNum || 0,
    customerNum: customerNum || 0,
    instaCustomerNum: instaCustomerNum || 0,
    facebookCustomerNum: facebookCustomerNum || 0,
    memberCustomerNum: memberCustomerNum || 0,
    visitWebsiteNum: visitWebsiteNum || 0,
  };
}
