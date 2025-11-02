"use server";

import { Customers } from "../../../../../types/database/customers";
import { SupabaseError } from "../../../../../types/errors";
import { withOrgAuth } from "../../../../../utils/auth";
import { revalidatePath } from "next/cache";
import {
  validateResourceCreation,
  validateForUpdate,
  validatePlanAccess,
} from "../../../../../utils/validation";

export async function getCustomers(orgId: string, select?: string): Promise<Customers[]> {
  if (!orgId) return [];

  const { supabase } = await withOrgAuth(orgId);

  // get customers' data
  const { data, error } = (await supabase
    .from("customers")
    .select(select || "*")
    .eq("organization_id", orgId)) as { data: Customers[] | null; error: SupabaseError };

  if (error) throw error;

  return data || [];
}

export async function updateCustomerStatus(
  customerId: string,
  orgId: string,
  targetStatus: string
) {
  try {
    const { supabase, orgMember } = await withOrgAuth(orgId);

    // ========================================== check plan ==========================================
    const validation = await validateResourceCreation({
      orgId,
      orgMember,
      resourceType: "customers",
    });
    if (!validation.success) {
      return { success: false, error: validation.error };
    }
    // ========================================== /check plan ==========================================

    const { error } = await supabase
      .from("customers")
      .update({ status: targetStatus })
      .eq("id", customerId)
      .eq("organization_id", orgId);

    if (error) throw error;

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// ===== 추가: 인라인 수정용 API 함수 =====
export async function updateCustomerField({
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
    const allowedFields = ["name", "email"];
    if (!allowedFields.includes(fieldName)) {
      return { success: false, error: "Invalid field name" };
    }

    const { error } = await supabase
      .from("customers")
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
// =========================================
