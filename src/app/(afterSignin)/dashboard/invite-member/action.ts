"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { withOrgAuth } from "@/utils/auth";
import { getUsageForOrg } from "@/hooks/hook-actions/get-usage";
import { getPlanByOrg } from "@/hooks/hook-actions/get-plans";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();

  try {
    const { orgMember } = await withOrgAuth(orgId, ["owner", "admin", "member"]);

    // get user's current plan using existing action
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { error: "Failed to get user plan data" };
    }

    // get current usage using existing action
    const currentUsage = await getUsageForOrg(orgId ?? "");
    if (!currentUsage) {
      return { error: "Failed to get current usage data" };
    }

    // check if user can create more invitation
    const maxUsers = orgPlanData.plans.max_users || 0;
    if (currentUsage.userTotal >= maxUsers) {
      let errorMessage = `User limit reached. Your current organization allows up to ${maxUsers} users.`;

      if (orgMember?.role === "owner") {
        errorMessage += `\n\nAs the owner, you can upgrade your plan to increase the limit.`;
      }
      return {
        error: errorMessage,
      };
    }

    // check if expired
    if (orgPlanData.subscription.status !== "free") {
      const isExpired =
        orgPlanData.subscription.ends_at && new Date(orgPlanData.subscription.ends_at) < new Date();
      if (isExpired) {
        let errorMessage = `Your current organization plan is expired.`;

        if (orgMember?.role === "owner") {
          errorMessage += `\n\nAs the owner, you can renew your plan.`;
        }
        return {
          error: errorMessage,
        };
      }
    }

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

    // Optional: revalidate a path if needed
    // revalidatePath("/dashboard/organization");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
