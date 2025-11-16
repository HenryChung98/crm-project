"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { revalidatePath } from "next/cache";

export async function removeBulkLogs(logIds: string[], orgId: string) {
  try {
    const { supabase } = await requireOrgAccess(orgId, true, "admin");

    // verify customer exists and belongs to organization
    const { data: logToRemove, error: fetchError } = await supabase
      .from("activity_logs")
      .select("id")
      .in("id", logIds)
      .eq("organization_id", orgId);

    if (fetchError || !logToRemove || logToRemove.length === 0) {
      return { success: false, error: "Contact not found or access denied" };
    }

    // Verify all requested contacts were found
    if (logToRemove.length !== logIds.length) {
      return { success: false, error: "Some contacts not found or access denied" };
    }

    // delete customer
    const { error: deleteError } = await supabase
      .from("activity_logs")
      .delete()
      .in("id", logIds)
      .eq("organization_id", orgId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath(`orgs/${orgId}/activity-logs`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove customer",
    };
  }
}
