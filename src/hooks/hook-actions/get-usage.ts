"use server";
import { createClient } from "@/utils/supabase/server";
import { withOrgAuth } from "@/utils/auth";

export interface UsageByUser {
  orgTotal: number;
}

export interface UsageByOrganization {
  userTotal: number;
  customerTotal: number;
}

export async function getUsageForUser(): Promise<UsageByUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  const [orgTotalResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id),
  ]);

  // 에러 확인
  if (orgTotalResult.error) throw orgTotalResult.error;

  return {
    orgTotal: orgTotalResult.count || 0,
  };
}

export async function getUsageForOrg(orgId: string): Promise<UsageByOrganization | null> {
  if (!orgId) return null;

  const { user, orgMember, supabase } = await withOrgAuth(orgId);

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

  // 에러 확인
  if (userTotalResult.error) throw userTotalResult.error;

  return {
    userTotal: userTotalResult.count || 0,
    customerTotal: customerTotalResult.count || 0,
  };
}
