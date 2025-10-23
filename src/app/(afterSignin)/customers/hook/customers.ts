"use server";

import { Customers } from "@/types/database/customers";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { getPlanByOrg } from "@/hooks/hook-actions/get-plans";
import { getUsageForOrg } from "@/hooks/hook-actions/get-usage";

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

export async function updateCustomerStatus(customerId: string, orgId: string) {
  try {
    const { supabase, orgMember } = await withOrgAuth(orgId);

    // ========================================== check plan ==========================================
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { success: false, error: "Failed to get user plan data" };
    }

    const customerUsage = await getUsageForOrg(orgId ?? "");
    if (!customerUsage) {
      return { success: false, error: "Failed to get current usage data" };
    }

    // check if user can create more customer
    const maxCustomers = orgPlanData.plans.max_customers || 0;
    if (customerUsage.customerTotal >= maxCustomers) {
      let errorMessage = `User limit reached. Your current plan allows up to ${maxCustomers} users.`;

      if (orgMember?.role === "owner") {
        errorMessage += `\n\nAs the owner, you can upgrade your plan to increase the limit.`;
      }
      return {
        success: false,
        error: errorMessage,
      };
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
          success: false,
          error: errorMessage,
        };
      }
    }
    // ========================================== /check plan ==========================================

    const { error } = await supabase
      .from("customers")
      .update({ status: "customer" })
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
    const { supabase, orgMember } = await withOrgAuth(orgId, ["owner"]);

    // 유효성 검사: 허용된 필드만 업데이트
    const allowedFields = ["name", "email", "source"];
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
