"use server";

import { createClient } from "@/utils/supabase/server";
import { getUsageForUser } from "@/hooks/hook-actions/get-usage";
import { getPlanByUser } from "@/hooks/hook-actions/get-plans";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const orgName = formData.get("orgName")?.toString().trim();
  const orgCountry = formData.get("orgCountry")?.toString().trim();
  const orgProvince = formData.get("orgProvince")?.toString().trim();
  const orgCity = formData.get("orgCity")?.toString().trim();

  // check all fields
  if (!orgName || !orgCountry || !orgCity) {
    return { error: "Organization's name, country, and city are required." };
  }

  // province validation
  const englishCharsRegex = /^[A-Za-z]+$/;
  const isValidProvince =
    !orgProvince || (orgProvince.length === 2 && englishCharsRegex.test(orgProvince));
  if (!isValidProvince) {
    return { error: "Province / State must be exactly English 2 characters." };
  }

  // get user from auth.users
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get user:", userError?.message);
    return { error: "Unauthorized" };
  }

  // get user's current plan using existing action
  const userPlanData = await getPlanByUser();
  if (!userPlanData?.plans) {
    return { error: "Failed to get user plan data" };
  }

  // get current usage using existing action
  const currentUsage = await getUsageForUser();
  if (!currentUsage) {
    return { error: "Failed to get current usage data" };
  }

  // check if user can create more organizations
  const maxOrganizations = userPlanData.plans.max_organization_num || 0;
  if (currentUsage.orgTotal >= maxOrganizations) {
    return {
      error: `Organization limit reached. Your current plan allows up to ${maxOrganizations} organizations.`,
    };
  }

  // check if expired
  if (userPlanData.subscription.status !== "free") {
    const isExpired =
      userPlanData.subscription.ends_at && new Date(userPlanData.subscription.ends_at) < new Date();
    if (isExpired) {
      let errorMessage = `Your current plan is expired.`;

      return {
        error: errorMessage,
      };
    }
  }

  // insert organization data to the table
  const orgData = {
    name: orgName,
    country: orgCountry,
    state_province: orgProvince ? orgProvince.toUpperCase() : null,
    city: orgCity,
    created_by: user.id,
  };

  const { data: orgInsertData, error: orgDataError } = await supabase
    .from("organizations")
    .insert([orgData])
    .select("id")
    .single();

  if (orgDataError) {
    if (orgDataError.code === "23505") {
      // Unique violation
      return { error: "The organization name already exists." };
    }
    return { error: orgDataError.message };
  }

  // insert organization members data to the public table
  const orgMemberData = {
    organization_id: orgInsertData.id,
    organization_name: orgData.name,
    user_id: user.id,
    role: "owner",
    invited_by: null,
    user_email: user.email,
  };

  const { error: orgMemberDataError } = await supabase
    .from("organization_members")
    .insert([orgMemberData])
    .select("id")
    .single();

  if (orgMemberDataError) {
    await supabase.from("organizations").delete().eq("id", orgInsertData.id);
    return { error: orgMemberDataError.message };
  }

  return { success: true };
}
