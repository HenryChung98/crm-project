"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { revalidatePath } from "next/cache";
import { validateSubscription } from "@/shared-actions/action-validations";

export async function updateContactField({
  customerId,
  fieldName,
  newValue,
  orgId,
}: {
  customerId: string;
  fieldName: string;
  newValue: string;
  orgId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireOrgAccess(orgId, true);

    // check plan
    const validation = await validateSubscription(orgId);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // 유효성 검사: 허용된 필드만 업데이트
    const allowedFields = ["name", "email", "status"];
    if (!allowedFields.includes(fieldName)) {
      return { success: false, error: "Invalid field name" };
    }

    const { error } = await supabase
      .from("contacts")
      .update({ [fieldName]: newValue })
      .eq("id", customerId)
      .eq("organization_id", orgId);

    if (error) {
      console.error("Update customer field error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update customer field error:", error);
    return { success: false, error: "Server error" };
  }
}
// ==================================================================================

export async function removeBulkContacts(contactIds: string[], orgId: string) {
  try {
    const { supabase, orgMember } = await requireOrgAccess(orgId, false, "admin");

    // verify customer exists and belongs to organization
    const { data: contactToRemove, error: fetchError } = await supabase
      .from("contacts")
      .select("id, email")
      .in("id", contactIds)
      .eq("organization_id", orgId);

    if (fetchError || !contactToRemove || contactToRemove.length === 0) {
      return { success: false, error: "Contact not found or access denied" };
    }

    // Verify all requested contacts were found
    if (contactToRemove.length !== contactIds.length) {
      return { success: false, error: "Some contacts not found or access denied" };
    }

    // delete customer
    const { error: deleteError } = await supabase
      .from("contacts")
      .delete()
      .in("id", contactIds)
      .eq("organization_id", orgId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      // Log the deletions
      const activityLogsData = contactToRemove.map((contact) => ({
        organization_id: orgId,
        entity_id: contact.id,
        entity_type: "contact",
        action: "contact-deleted",
        changed_data: {
          contact_email: contact.email,
        },
        performed_by: orgMember.id,
      }));

      const { error: activityLogError } = await supabase
        .from("activity_logs")
        .insert(activityLogsData);

      if (activityLogError) {
        return { success: false, error: activityLogError.message };
      }
    }

    revalidatePath(`orgs/${orgId}/crm/crmcontact`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove customer",
    };
  }
}
