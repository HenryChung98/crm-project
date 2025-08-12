"use server";

import { createClient } from "@/utils/supabase/server";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const orgId = formData.get("orgId")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  // check all fields
  if (!orgId || !firstName || !lastName || !source || !email) {
    return { error: "Customer's name, email and source are required." };
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

  // check duplicate
  const { data: existingCustomer, error: checkError } = await supabase
    .from("customers")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", email)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    return { error: checkError.message };
  }
  if (existingCustomer) {
    return { error: "This customer already exists." };
  }

  // check user is in the organization
  const { data: validUser, error: validUserError } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgId)
    .single();

  if (validUserError && validUserError.code !== "PGRST116") {
    return { error: validUserError.message };
  }

  const customerData = {
    organization_id: orgId,
    first_name: firstName,
    last_name: lastName,
    source: source,
    email: email ?? null,
    phone: phone ?? null,
    status: "new",
    tag: "regular",
    note: note ?? null,
  };

  const { data: customerInsertData, error: customerDataError } = await supabase
    .from("customers")
    .insert([customerData])
    .select("id")
    .single();

  if (customerDataError) {
    return { error: customerDataError.message };
  }

  const customerLogData = {
    customer_id: customerInsertData.id,
    action: "created",
    changed_data: customerData,
    performed_by: validUser?.id,
  };

  const { data: customerLogInsert, error: customerLogError } = await supabase
    .from("customer_logs")
    .insert([customerLogData])
    .select("id")
    .single();

  if (customerLogError) {
    return { error: customerLogError.message };
  }

  return { success: true };
}
