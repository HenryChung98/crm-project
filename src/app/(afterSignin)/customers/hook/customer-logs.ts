"use server";

import { ActivityLogs } from "@/types/database/customers";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";

export async function getCustomerLogs(orgId: string, select?: string): Promise<ActivityLogs[]> {
  if (!orgId) return [];

  const { supabase } = await withOrgAuth(orgId);

  // get organization_id of customer
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id")
    .eq("organization_id", orgId);

  if (customersError) {
    throw new Error("Failed to fetch customers");
  }

  if (!customers || customers.length === 0) {
    return [];
  }

  const customerIds = customers.map((customer) => customer.id);

  // get logs
  const { data, error } = (await supabase
    .from("customer_logs")
    .select(
      select ||
        `
      *,
      organization_members:performed_by(
      user_email
    )
    `
    )
    .in("entity_id", customerIds)
    .order("performed_at", { ascending: false })) as {
    data: ActivityLogs[] | null;
    error: SupabaseError;
  };

  if (error) throw error;

  return data || [];
}
