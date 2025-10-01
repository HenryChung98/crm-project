"use server";

import { withOrgAuth } from "@/utils/auth";
import { getPlanByOrg } from "@/hooks/hook-actions/get-plans";
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
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { error: "Failed to get user plan data" };
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
    // ========================================== /check plan expiration ==========================================

    // check all required fields
    if (!customerId || !orgId || !firstName || !lastName || !email) {
      return { error: "Customer ID, name, and email are required." };
    }

    // verify customer exists and belongs to organization
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("id, email")
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
      email: email ?? null,
      phone: phone ?? null,
      note: note ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .eq("organization_id", orgId);

    if (updateError) {
      return { error: updateError.message };
    }

    const customerLogData = {
      organization_id: orgId,
      entity_id: customerId,
      entity_type: "customer",
      action: "customer-updated",
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

    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
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

    // ========================================== check plan expiration ==========================================
    const orgPlanData = await getPlanByOrg(organizationId);
    if (!orgPlanData?.plans) {
      return { error: "Failed to get user plan data" };
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
    // ========================================== /check plan expiration ==========================================

    // verify customer exists and belongs to organization
    const { data: customerToRemove, error: fetchError } = await supabase
      .from("customers")
      .select("id")
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
    const customerLogData = {
      organization_id: organizationId,
      entity_id: customerId,
      entity_type: "customer",
      action: "customer-deleted",
      changed_data: { deleted_at: new Date().toISOString() },
      performed_by: orgMember?.id,
    };

    const { error: customerLogError } = await supabase
      .from("customer_logs")
      .insert([customerLogData])
      .select("id")
      .single();

    if (customerLogError) {
      return { success: false, error: customerLogError.message };
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
