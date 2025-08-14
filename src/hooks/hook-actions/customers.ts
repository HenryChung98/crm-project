"use server";

import { Database } from "@/types/database";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";
type Customers = Database["public"]["Tables"]["customers"]["Row"];

export async function getCustomers(orgId: string, select?: string): Promise<Customers[]> {
  if (!orgId) return [];

  const { user, orgMember, supabase } = await withOrgAuth(orgId);

  // get customers' data
  const { data, error } = (await supabase
    .from("customers")
    .select(select || "*")
    .eq("organization_id", orgId)) as { data: Customers[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}
