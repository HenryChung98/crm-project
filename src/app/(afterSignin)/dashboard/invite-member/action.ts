"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();

  if (!invitedEmail || !orgId) {
    return { error: "Email and organization are required." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (!user || sessionError) {
    return { error: "Not authenticated." };
  }

  // prevent duplicated invitation
  const { data: existingInvite, error: checkError } = await supabase
    .from("organization_invitations")
    .select("id")
    .eq("email", invitedEmail)
    .eq("organization_id", orgId)
    .eq("accepted", false)
    .maybeSingle();

  if (checkError) {
    return { error: "Error checking existing invitation: " + checkError.message };
  }

  if (existingInvite) {
    return { error: "User has already been invited to this organization." };
  }

  const code = randomUUID();

  const { error: inviteError } = await supabase
    .from("organization_invitations")
    .insert({
      id: code,
      email: invitedEmail,
      organization_id: orgId,
      invited_by: user.id,
      accepted: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

  if (inviteError) {
    return { error: inviteError.message };
  }

  // Optional: revalidate a path if needed
  // revalidatePath("/dashboard/organization");

  return { success: true };
}
