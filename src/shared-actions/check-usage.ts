"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";

export async function checkMemberUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { count, error } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}

export async function checkContactUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { count, error } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}

export async function checkEmailSenderUsage(orgId: string): Promise<number | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { count, error } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;

  return count || 0;
}
