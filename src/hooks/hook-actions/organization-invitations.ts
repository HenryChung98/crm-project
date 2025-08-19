"use server";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { SupabaseError } from "@/types/errors";
import { revalidateTag } from "next/cache";

type OrgMember = Database["public"]["Tables"]["organization_invitations"]["Row"];
export async function getOrganizationInvitationsByEmail(): Promise<OrgMember[]> {
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
    .eq("accepted", false)) as { data: OrgMember[] | null; error: SupabaseError };

  if (error) throw error;
  return data || [];
}
