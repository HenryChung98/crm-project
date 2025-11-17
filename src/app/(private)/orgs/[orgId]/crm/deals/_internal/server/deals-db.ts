"use server";
import { DealType } from "@/types/database/deals";
import { requireOrgAccess } from "@/shared-utils/org-access";

export async function getDealsDB(orgId: string): Promise<DealType[] | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
    *,
    contact:contact_id(*),
    product:product_id(*)
  `
    )
    .eq("organization_id", orgId);

  if (error) throw error;

  return data ?? [];
}
