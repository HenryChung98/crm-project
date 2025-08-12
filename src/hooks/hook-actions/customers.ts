"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { SupabaseError } from "@/types/errors";
type Customers = Database["public"]["Tables"]["customers"]["Row"];

export async function getCustomers(organizationId: string, select?: string): Promise<Customers[]> {
  if (!organizationId) return [];

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw new Error("User not authenticated");
  }

  // check user is the organization member
  const { data: memberCheck, error: memberError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .single();

  if (memberError) {
    throw new Error("Organization access denied");
  }

  if (!memberCheck) {
    throw new Error("You are not a member of this organization");
  }

  // get customers' data
  const { data, error } = (await supabase
    .from("customers")
    .select(select || "*")
    .eq("organization_id", organizationId)) as { data: Customers[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}
