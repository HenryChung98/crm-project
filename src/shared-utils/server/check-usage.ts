"use server";
import { requireOrgAccess } from "@/shared-utils/server/org-access";
import { createClient } from "../supabase/server";

export interface Usage {
  userTotal: number;
  customerTotal: number;
}

export async function checkUsage(orgId: string): Promise<Usage | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId);

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
