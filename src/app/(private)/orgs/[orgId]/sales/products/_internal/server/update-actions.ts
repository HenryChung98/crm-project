"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { revalidatePath } from "next/cache";
import { validateSubscription } from "@/shared-actions/action-validations";

export async function updateProductField({
  productId,
  fieldName,
  newValue,
  orgId,
}: {
  productId: string;
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
    const allowedFields = ["name", "sku", "type", "description", "price", "cost", "status", "note"];
    if (!allowedFields.includes(fieldName)) {
      return { success: false, error: "Invalid field name" };
    }

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({ [fieldName]: newValue })
      .eq("id", productId)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error) {
      console.error("Update product field error:", error);
      return { success: false, error: error.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      const activityLogsData = {
        organization_id: orgId,
        entity_id: updatedProduct.id,
        entity_type: "product",
        action: "product-update",
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
    console.error("Update product field error:", error);
    return { success: false, error: "Server error" };
  }
}
// ==================================================================================

export async function removeBulkProducts(productIds: string[], orgId: string) {
  try {
    const { supabase, orgMember } = await requireOrgAccess(orgId, false, "admin");

    // verify customer exists and belongs to organization
    const { data: productToRemove, error: fetchError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds)
      .eq("organization_id", orgId);

    if (fetchError || !productToRemove || productToRemove.length === 0) {
      return { success: false, error: "Product not found or access denied" };
    }

    // Verify all requested contacts were found
    if (productToRemove.length !== productIds.length) {
      return { success: false, error: "Some products not found or access denied" };
    }

    // delete customer
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .in("id", productIds)
      .eq("organization_id", orgId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      // Log the deletions
      const activityLogsData = productToRemove.map((product) => ({
        organization_id: orgId,
        entity_id: product.id,
        entity_type: "product",
        action: "product-deleted",
        changed_data: {
          product_name: product.name,
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

    revalidatePath(`orgs/${orgId}/sales/products`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove customer",
    };
  }
}
