"use server";

import { Products } from "@/types/database/products";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { validateResourceCreation, validatePlanAccess } from "@/utils/validation";

export async function getProducts(orgId: string, select?: string): Promise<Products[]> {
  if (!orgId) return [];

  const { supabase } = await withOrgAuth(orgId);

  const { data, error } = (await supabase
    .from("products")
    .select(select || "*")
    .order("created_at", { ascending: false })
    .eq("organization_id", orgId)) as { data: Products[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}

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
    const { supabase, orgMember } = await withOrgAuth(orgId);

    // ========================================== check plan ==========================================
    const planValidation = await validatePlanAccess(orgId, "premium");
    if (!planValidation.success) {
      return { success: false, error: planValidation.error };
    }

    const validation = await validateResourceCreation({
      orgId,
      orgMember,
      resourceType: "customers",
    });
    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    // ========================================== /check plan ==========================================

    // 유효성 검사: 허용된 필드만 업데이트
    const allowedFields = ["name", "sku", "description", "price", "cost", "note", "status", "type"];
    if (!allowedFields.includes(fieldName)) {
      return { success: false, error: "Invalid field name" };
    }

    const { error } = await supabase
      .from("products")
      .update({ [fieldName]: newValue })
      .eq("id", productId)
      .eq("organization_id", orgId);

    if (error) {
      console.error("Update product field error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update product field error:", error);
    return { success: false, error: "Server error" };
  }
}
