"use server";

import { withOrgAuth } from "@/utils/auth";
import { validateForUpdate } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function updateCustomer(formData: FormData) {
  const customerId = formData.get("customerId")?.toString().trim();
  const orgId = formData.get("orgId")?.toString().trim();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  try {
    const { orgMember, supabase } = await withOrgAuth(orgId, ["owner", "admin"]);

    // ========================================== check plan expiration ==========================================
    const validation = await validateForUpdate({
      orgId: orgId!,
      orgMember,
    });
    if (!validation.success) {
      return { error: validation.error };
    }
    // ========================================== /check plan expiration ==========================================

    if (!customerId || !orgId || !firstName || !lastName || !email) {
      return { error: "Customer ID, name, and email are required." };
    }

    // verify customer exists and get current data
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name, phone, note")
      .eq("id", customerId)
      .eq("organization_id", orgId)
      .single();

    if (fetchError || !existingCustomer) {
      return { error: "Customer not found or access denied." };
    }

    // check duplicate email (only if email changed)
    if (existingCustomer.email !== email) {
      const { data: duplicateCustomer, error: checkError } = await supabase
        .from("customers")
        .select("id")
        .eq("organization_id", orgId)
        .eq("email", email)
        .neq("id", customerId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        return { error: checkError.message };
      }
      if (duplicateCustomer) {
        return { error: "This email is already used by another customer." };
      }
    }

    const customerData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || null,
      note: note || null,
      updated_at: new Date().toISOString(),
    };

    // detect changes
    const changedData: Record<
      string,
      { old: string | number | null; new: string | number | null | undefined }
    > = {};

    // need this for nullable columns
    const normalizedPhone = phone || null;
    const normalizedNote = note || null;

    if (existingCustomer.first_name !== firstName) {
      changedData.first_name = { old: existingCustomer.first_name, new: firstName };
    }
    if (existingCustomer.last_name !== lastName) {
      changedData.last_name = { old: existingCustomer.last_name, new: lastName };
    }
    if (existingCustomer.email !== email) {
      changedData.email = { old: existingCustomer.email, new: email };
    }
    if (existingCustomer.phone !== normalizedPhone) {
      changedData.phone = { old: existingCustomer.phone, new: normalizedPhone };
    }
    if (existingCustomer.note !== normalizedNote) {
      changedData.note = { old: existingCustomer.note, new: normalizedNote };
    }

    // if no changes, return early
    if (Object.keys(changedData).length === 0) {
      return { success: true, customerId, message: "No changes detected" };
    }

    // update customer
    const { error: updateError } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .eq("organization_id", orgId);

    if (updateError) {
      return { error: updateError.message };
    }

    // log only changed fields
    const activityLogData = {
      organization_id: orgId,
      entity_id: customerId,
      entity_type: "customer",
      action: "customer-updated",
      changed_data: changedData,
      performed_by: orgMember.id,
    };

    const { error: activityLogError } = await supabase
      .from("activity_logs")
      .insert([activityLogData])
      .select("id")
      .single();

    if (activityLogError) {
      return { error: activityLogError.message };
    }

    revalidatePath(`/customers?org=${orgId}`);
    revalidatePath(`/customers/${customerId}?org=${orgId}`);
    revalidatePath(`/dashboard?org=${orgId}`);
    revalidatePath(`/customers/log?org=${orgId}`);

    return { success: true, customerId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function removeCustomer(customerId: string, organizationId: string) {
  try {
    const { supabase, orgMember } = await withOrgAuth(organizationId, ["owner", "admin"]);

    // verify customer exists and belongs to organization
    const { data: customerToRemove, error: fetchError } = await supabase
      .from("customers")
      .select("id, email")
      .eq("id", customerId)
      .eq("organization_id", organizationId)
      .single();

    if (fetchError || !customerToRemove) {
      return { success: false, error: "Customer not found or access denied" };
    }

    // delete customer
    const { error: deleteError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
      .eq("organization_id", organizationId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // log the deletion
    const activityLogData = {
      organization_id: organizationId,
      entity_id: customerId,
      entity_type: "customer",
      action: "customer-deleted",
      changed_data: {
        customer_email: customerToRemove.email,
        deleted_at: new Date().toISOString(),
      },
      performed_by: orgMember.id,
    };

    const { error: activityLogError } = await supabase
      .from("activity_logs")
      .insert([activityLogData])
      .select("id")
      .single();

    if (activityLogError) {
      return { success: false, error: activityLogError.message };
    }

    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove customer",
    };
  }
}
