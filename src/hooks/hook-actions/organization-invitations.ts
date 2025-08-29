"use server";
import { createClient } from "@/utils/supabase/server";
import { SupabaseError } from "@/types/errors";
import { revalidateTag } from "next/cache";

// type
import { OrganizationInvitations } from "@/types/database/organizations";

export async function getOrganizationInvitationsByEmail(): Promise<OrganizationInvitations[]> {
  const supabase = await createClient();

  // 사용자 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
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
