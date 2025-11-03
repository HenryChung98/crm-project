"use server";

import { createClient } from "@/shared-utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptInvitation(orgId: string, orgName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // check auth user
  if (!user) throw new Error("You must Sign up");

  // check invitation is valid for the user
  const { data: invitation, error: inviteError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("organization_id", orgId)
    .eq("email", user.email)
    .eq("accepted", false)
    .gt("expires_at", "now()")
    .single();

  if (inviteError || !invitation) {
    console.log(inviteError);
    throw new Error("Invalid invitation.");
  }

  // check user is already in the organization
  const { data: checkDup, error: checkDupError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (checkDupError && checkDupError.code !== "PGRST116") {
    throw new Error("Unknown error.");
  }
  if (checkDup) {
    throw new Error("You are already a member of the organization.");
  }

  // update accepted = true
  const { error: updateError } = await supabase
    .from("organization_invitations")
    .update({ accepted: true })
    .eq("organization_id", orgId);

  if (updateError) {
    throw updateError;
  }

  // 4. insert user info to organization_members
  const { error: insertError } = await supabase.from("organization_members").insert({
    organization_id: invitation.organization_id,
    user_id: user.id,
    invited_by: invitation.invited_by,
    role: "member",
    organization_name: orgName,
    user_email: user.email,
  });

  if (insertError) {
    throw insertError;
  }

  revalidatePath(`/orgs/${invitation.organization_id}/dashboard`);
  return { success: true };
}
