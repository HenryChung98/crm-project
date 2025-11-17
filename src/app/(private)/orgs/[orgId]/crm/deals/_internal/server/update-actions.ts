"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { revalidatePath } from "next/cache";
import { validateSubscription } from "@/shared-actions/action-validations";

export async function updateDealField({
  dealId,
  fieldName,
  newValue,
  orgId,
}: {
  dealId: string;
  fieldName: string;
  newValue: string;
  orgId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, orgMember } = await requireOrgAccess(orgId, true);

    // check plan
    const validation = await validateSubscription(orgId);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // 유효성 검사: 허용된 필드만 업데이트
    const allowedFields = ["name", "stage", "note"];
    if (!allowedFields.includes(fieldName)) {
      return { success: false, error: "Invalid field name" };
    }

    const { data: updatedDeal, error } = await supabase
      .from("deals")
      .update({ [fieldName]: newValue })
      .eq("id", dealId)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error) {
      console.error("Update deal field error:", error);
      return { success: false, error: error.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      const activityLogsData = {
        organization_id: orgId,
        entity_id: updatedDeal.id,
        entity_type: "deal",
        action: "deal-update",
        changed_data: {
          [fieldName]: newValue,
        },
        performed_by: orgMember.id,
      };

      const { error: activityLogError } = await supabase
        .from("activity_logs")
        .insert(activityLogsData);

      if (activityLogError) {
        return { success: false, error: activityLogError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Update deal field error:", error);
    return { success: false, error: "Server error" };
  }
}
// ==================================================================================

export async function removeBulkDeals(dealIds: string[], orgId: string) {
  try {
    const { supabase, orgMember } = await requireOrgAccess(orgId, false, "admin");

    // verify customer exists and belongs to organization
    const { data: dealToRemove, error: fetchError } = await supabase
      .from("deals")
      .select("id, name")
      .in("id", dealIds)
      .eq("organization_id", orgId);

    if (fetchError || !dealToRemove || dealToRemove.length === 0) {
      return { success: false, error: "Deal not found or access denied" };
    }

    // Verify all requested contacts were found
    if (dealToRemove.length !== dealIds.length) {
      return { success: false, error: "Some contacts not found or access denied" };
    }

    // delete customer
    const { error: deleteError } = await supabase
      .from("deals")
      .delete()
      .in("id", dealIds)
      .eq("organization_id", orgId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      // Log the deletions
      const activityLogsData = dealToRemove.map((deal) => ({
        organization_id: orgId,
        entity_id: deal.id,
        entity_type: "deal",
        action: "deal-delete",
        changed_data: {
          deal_name: deal.name,
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

    revalidatePath(`orgs/${orgId}/crm/deals`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove customer",
    };
  }
}
