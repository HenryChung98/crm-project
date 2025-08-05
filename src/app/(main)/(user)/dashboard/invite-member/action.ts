"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email") as string;
  if (!invitedEmail) return { error: "Email is required." };

  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (!user || sessionError) return { error: "Not authenticated." };

  // get organization_id from users table
  const { data: orgData, error: orgError } = await supabase
    .from("users") // public.users 테이블
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (orgError) {
    return { error: "Failed to fetch organization ID: " + orgError.message };
  }
  if (!orgData) {
    return { error: "User not found in public.users table." };
  }
  const organizationId = orgData.organization_id;
  if (!organizationId) return { error: "Organization not found." };

  const code = randomUUID();

  const { error: inviteError } = await supabase.from("organization_invitations").insert({
    id: code,
    email: invitedEmail,
    organization_id: organizationId,
    invited_by: user.id,
    accepted: false,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 유효
  });

  if (inviteError) return { error: inviteError.message };

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(invitedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL_DEV}/invite/accept?code=${code}`,
    });
  } catch (emailError) {
    console.error("Failed to send invitation email:", emailError);
  }

  revalidatePath("/organization/members");

  return { success: true };
}
