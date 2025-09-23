"use server";

import { Products } from "@/types/database/products";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";

export async function getProducts(orgId: string, select?: string): Promise<Products[]> {
  if (!orgId) return [];

  const { supabase } = await withOrgAuth(orgId);

  const { data, error } = (await supabase
    .from("products")
    .select(select || "*")
    .order("created_at", { ascending: false })
    .eq("organization_id", orgId)) as { data: Products[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}
