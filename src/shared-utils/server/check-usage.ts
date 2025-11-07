"use server";
import { requireOrgAccess } from "@/shared-utils/server/org-access";

export async function checkMemberUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId);

  const { count, error } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}

export async function checkCustomersUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId);

  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}

export async function checkEmailSenderUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId);

  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}
