"use server";
// import { withOrgAuth } from "../../../../../crmtrash/src-l/utils/auth";
import { createClient } from "../../utils/supabase/server";

export interface UsageByOrganization {
  userTotal: number;
  customerTotal: number;
}

export async function getUsage(orgId: string): Promise<UsageByOrganization | null> {
  if (!orgId) return null;

  // const { supabase } = await withOrgAuth(orgId);
  const supabase = await createClient();

  const [userTotalResult, customerTotalResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),

    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
  ]);

  if (userTotalResult.error) throw userTotalResult.error;

  return {
    userTotal: userTotalResult.count || 0,
    customerTotal: customerTotalResult.count || 0,
  };
}
