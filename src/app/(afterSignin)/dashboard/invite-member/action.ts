"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { getUsageForOrg } from "@/hooks/hook-actions/get-usage";
import { getPlanByOrg } from "@/hooks/hook-actions/get-plans";

export async function inviteUser(formData: FormData) {
  const invitedEmail = formData.get("email")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();

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
 
   // check if user can create more organizations
   const maxUsers = orgPlanData.plans.max_users || 0;
   if (currentUsage.userTotal >= maxUsers) {
     return {
       error: `User limit reached. Your current plan allows up to ${maxUsers} users.`,
     };
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
}
