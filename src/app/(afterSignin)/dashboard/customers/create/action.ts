"use server";

import { withOrgAuth } from "@/utils/auth";

export async function createCustomer(formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  const { user, orgMember, supabase } = await withOrgAuth(orgId, ["owner", "admin"]);
  // check all fields
  if (!orgId || !firstName || !lastName || !source || !email) {
    return { error: "Customer's name, email and source are required." };
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
    action: "customer-created",
    changed_data: customerData,
    performed_by: orgMember?.id,
  };

  const { error: customerLogError } = await supabase
    .from("customer_logs")
    .insert([customerLogData])
    .select("id")
    .single();

  if (customerLogError) {
    return { error: customerLogError.message };
  }

  return { success: true };
}
