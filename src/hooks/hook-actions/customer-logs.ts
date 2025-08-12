"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { SupabaseError } from "@/types/errors";

type CustomerLogs = Database["public"]["Tables"]["customer_logs"]["Row"];

export async function getCustomerLogs(orgId: string, select?: string): Promise<CustomerLogs[]> {
  if (!orgId) return [];

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  // check user is valid to access
  const { data: memberCheck, error: memberError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .single();

  if (memberError) {
    if (memberError.code === "PGRST116") {
      // No rows found - not a member
      throw new Error("Access denied: Not a member of the organization");
    } else {
      // 실제 쿼리 에러
      throw new Error(`Database error: ${memberError.message}`);
    }
  }

  if (!memberCheck) {
    throw new Error("Access denied: Not a member of the organization");
  }

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
    .in("customer_id", customerIds)
    .order("performed_at", { ascending: false })) as {
    data: CustomerLogs[] | null;
    error: SupabaseError;
  };

  if (error) throw error;

  return data || [];
}
