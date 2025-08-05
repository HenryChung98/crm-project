"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const orgName = formData.get("orgName") as string;
  const orgCountry = formData.get("orgCountry") as string;
  const orgProvince = formData.get("orgProvince") as string;
  const orgCity = formData.get("orgCity") as string;

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

  // check user has organization_id
  const { data: userPublicData, error: userPublicError } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  // The code handles any critical database issues that may arise from the query,
  // returning an error if one is found. However, a "record not found" error (PGRST116)
  // is ignored, allowing the code to proceed.
  if (userPublicError && userPublicError.code !== "PGRST116") {
    console.error("Failed to fetch user's public profile:", userPublicError);
    return { error: "Failed to check user's organization status." };
  }

  // If a user record is found in the users table and the organization_id is already
  //  assigned, an error is returned to prevent them from creating a new organization.
  if (userPublicData?.organization_id) {
    return {
      error:
        "Your account is already associated with an existing organization.\nTo create a new organization, please sign in with a different account.",
    };
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
    const msg = orgDataError.message;
    if (msg.includes("duplicate")) {
      return { error: "The organization name already exists." };
    }
    return { error: msg };
  }

  // insert user data to the public table
  const orgId = orgInsertData.id;
  const userData = {
    id: user.id,
    organization_id: orgId,
    role: "owner",
  };

  const { error: userDataError } = await supabase
    .from("users")
    .upsert([userData], { onConflict: "id" });

  if (userDataError) {
    const msg = userDataError.message;

    return { error: msg };
  }

  redirect("/");
}
