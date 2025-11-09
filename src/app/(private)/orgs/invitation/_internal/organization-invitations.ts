"use server";
import { SupabaseError } from "@/types/errors";
import { createClient } from "@/supabase/server";
// type
import { OrganizationInvitations } from "@/types/database/organizations";

export async function checkInvitation(): Promise<OrganizationInvitations[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (!user || sessionError) {
    throw new Error("User not authenticated");
  }

  const { data, error } = (await supabase
    .from("organization_invitations")
    .select("id, organization_id, email, organizations(name)")
    .eq("email", user.email)
    .eq("accepted", false)) as { data: OrganizationInvitations[] | null; error: SupabaseError };

  if (error) throw error;
  return data || [];
}
