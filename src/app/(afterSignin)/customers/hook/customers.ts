"use server";

import { Customers } from "@/types/database/customers";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function getCustomers(orgId: string, select?: string): Promise<Customers[]> {
  if (!orgId) return [];

  const { supabase } = await withOrgAuth(orgId);

  // get customers' data
  const { data, error } = (await supabase
    .from("customers")
    .select(select || "*")
    .eq("organization_id", orgId)) as { data: Customers[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}

export async function updateCustomerStatus(customerId: string, orgId: string) {
  try {
    const { supabase } = await withOrgAuth(orgId);

    const { error } = await supabase
      .from("customers")
      .update({ status: "customer" })
      .eq("id", customerId)
      .eq("organization_id", orgId);

    if (error) throw error;

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}
