"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/utils/supabase/server";
import { withOrgAuth } from "@/utils/auth";
import { validateResourceCreation } from "@/utils/validation";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();

  try {
    const { orgMember, supabase, user } = await withOrgAuth(orgId, ["owner", "admin"]);

    // ========================================== check plan ==========================================
    const validation = await validateResourceCreation({
      orgId: orgId!,
      orgMember,
      resourceType: "users",
    });
    if (!validation.success) {
      return { error: validation.error };
    }
    // ========================================== /check plan ==========================================
    if (!invitedEmail || !orgId) {
      return { error: "Email and organization are required." };
    }

    // Check if user is already a member of the organization
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("organization_members")
      .select("id, user_email")
      .eq("organization_id", orgId)
      .eq("user_email", invitedEmail)
      .maybeSingle();

    if (memberCheckError) {
      return { error: "Error checking existing membership: " + memberCheckError.message };
    }

    if (existingMember) {
      return { error: "User is already a member of this organization." };
    }

    // Check if user has already been invited to this organization

    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("email", invitedEmail)
      .eq("organization_id", orgId)
      .eq("accepted", false)
      .gt("expires_at", "now()")
      .maybeSingle();

    if (inviteCheckError) {
      return { error: "Error checking existing invitation: " + inviteCheckError.message };
    }

    if (existingInvite) {
      return { error: "User has already been invited to this organization." };
    }

    const code = randomUUID();

    const { error: inviteError } = await supabase.from("organization_invitations").insert({
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

    // send invitation by admin function

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    if (orgError || !orgData) {
      return { error: "Failed to get organization details" };
    }

    const adminSupabase = await createAdminClient();
    const { data, error: emailError } = await adminSupabase.auth.admin.inviteUserByEmail(
      invitedEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signup`,
        data: {
          OrganizationName: orgData.name,
          AppName: "CRM Project",
        },
      }
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
