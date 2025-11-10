"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { Resend } from "resend";
import { InvitationEmail } from "@/components/resend-components/templates/InvitationEmail";
import { validateMemberCreation } from "@/shared-actions/action-validations";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();

  try {
    const { supabase, user } = await requireOrgAccess(orgId, "admin");

    // ========================================== check plan ==========================================
    const validation = await validateMemberCreation(orgId!);
    if (!validation.success) {
      return { error: validation.error };
    }
    // ========================================== /check plan ==========================================
    if (!invitedEmail || !orgId) {
      return { error: "Email and organization are required." };
    }

    // // Check if user is already a member of the organization
    // const { data: existingMember, error: memberCheckError } = await supabase
    //   .from("organization_members")
    //   .select("user_email")
    //   .eq("organization_id", orgId)
    //   .eq("user_email", invitedEmail)
    //   .maybeSingle();

    // if (memberCheckError) {
    //   return { error: "Error checking existing membership: " + memberCheckError.message };
    // }

    // if (existingMember) {
    //   return { error: "User is already a member of this organization." };
    // }

    // // Check if user has already been invited to this organization
    // const { data: existingInvite, error: inviteCheckError } = await supabase
    //   .from("organization_invitations")
    //   .select("id")
    //   .eq("email", invitedEmail)
    //   .eq("organization_id", orgId)
    //   .eq("accepted", false)
    //   .gt("expires_at", "now()")
    //   .maybeSingle();

    // if (inviteCheckError) {
    //   return { error: "Error checking existing invitation: " + inviteCheckError.message };
    // }

    // if (existingInvite) {
    //   return { error: "User has already been invited to this organization." };
    // }

    // const { data: invitationData, error: invitationError } = await supabase
    //   .from("organization_invitations")
    //   .insert({
    //     email: invitedEmail,
    //     organization_id: orgId,
    //     invited_by: user.id,
    //     accepted: false,
    //     expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   })
    //   .select("id")
    //   .single();

    // if (invitationError) {
    //   return { error: invitationError.message };
    // }
    const { data, error } = await supabase.rpc("invite_user_rpc", {
      p_org_id: orgId,
      p_email: invitedEmail,
      p_invited_by: user.id,
    });

    if (error || data?.error) return { error: error?.message || data.error };

    // ===============================resend=======================================================

    if (invitedEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // send invitation by admin function
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", orgId)
          .single();

        if (orgError || !orgData) {
          await supabase.from("organization_invitations").delete().eq("id", data.invitation_id);
          return { error: "Failed to get organization name" };
        }

        const fromEmail =
          `${orgData?.name}@${process.env.RESEND_DOMAIN}` || process.env.DEFAULT_FROM_EMAIL;
        const fromName = orgData?.name || "CRM-Project";

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [invitedEmail],
          subject: `You have been invited`,
          html: InvitationEmail({
            orgId: orgId,
            orgName: fromName,
          }),
        });
      } catch (emailError) {
        await supabase.from("organization_invitations").delete().eq("id", data.invitation_id);
        console.error("Email error:", emailError);
      }
    }

    // const adminSupabase = await createAdminClient();
    // const { data, error: emailError } = await adminSupabase.auth.admin.inviteUserByEmail(
    //   invitedEmail,
    //   {
    //     redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signup?org_id=${orgId}&org_name=${orgData}`,
    //     data: {
    //       OrganizationName: orgData.name,
    //       AppName: "CRM Project",
    //     },
    //   }
    // );
    // if (emailError) {
    //   await supabase.from("organization_invitations").delete().eq("id", invitationData.id);
    //   return { error: `Email sending error: ${emailError.message}` };
    // }
    // ===============================resend=======================================================

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
