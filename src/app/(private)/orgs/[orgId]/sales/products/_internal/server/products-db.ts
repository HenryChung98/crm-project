"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { ProductType } from "@/types/database/products";

export async function getProductsDB(orgId: string): Promise<ProductType[] | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { data, error } = await supabase
    .from("products")
    .select(`*`)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
