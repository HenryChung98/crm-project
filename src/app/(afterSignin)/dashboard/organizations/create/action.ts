"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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
    role: "admin",
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

  redirect("/");
}
