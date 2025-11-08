"use server";
import { createClient } from "@/shared-utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  deactivateCurrentSubscription,
  createSubscription,
  SubscriptionData,
} from "./subscription-management";
import { PlanName, PlanType, PaymentStatus } from "@/types/database/plan";

interface ValidationViolation {
  type: "members" | "customers";
  orgId?: string;
  current: number;
  limit: number;
  message: string;
}

export interface PlanActionResult {
  success: boolean;
  error?: string;
  details?: string[];
  violations?: ValidationViolation[];
  subscriptionId?: string;
}

const isDowngrade = (currentPlan: PlanName, targetPlan: PlanName): boolean => {
  const planOrder = { free: 0, basic: 1, premium: 2 };
  return planOrder[targetPlan] < planOrder[currentPlan];
};

const updateSubscription = async (
  supabase: SupabaseClient,
  userId: string,
  targetPlan: PlanName,
  currentPlan?: PlanName
): Promise<PlanActionResult> => {
  try {
    // get target plan's limits
    const { data: targetPlanData, error: targetPlanError } = await supabase
      .from("plans")
      .select("id, max_users, max_customers")
      .eq("name", targetPlan)
      .single();

    if (targetPlanError || !targetPlanData) {
      throw new Error(`Error fetching plan limits: ${targetPlanError?.message || "Not found"}`);
    }

    // =========================== if downgrade, validate plan change  ===========================
    if (currentPlan && isDowngrade(currentPlan, targetPlan)) {
      const limits = {
        maxMembersPerOrg: targetPlanData.max_users || 0,
        maxCustomersPerOrg: targetPlanData.max_customers || 0,
      };
      const violations: ValidationViolation[] = [];

      // get user's own organization id
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("created_by", userId)
        .single();

      if (orgError || !organization) {
        throw new Error("Unable to retrieve organization.");
      }
      // get current all usage
      const [memberResult, customerResult] = await Promise.all([
        supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization.id),
      ]);

      const memberCount = memberResult.count ?? 0;
      const customerCount = customerResult.count ?? 0;

      if (memberResult.error || customerResult.error) {
        throw new Error(
          `Failed to count members/customers: ${
            memberResult.error?.message || customerResult.error?.message
          }`
        );
      }
      if (memberCount > limits.maxMembersPerOrg) {
        violations.push({
          type: "members",
          current: memberCount,
          limit: limits.maxMembersPerOrg,
          message: `There are ${memberCount} members in your organization.
            \n${targetPlan.toUpperCase()} plan allows up to ${limits.maxMembersPerOrg} members.`,
        });
      }

      if (customerCount > limits.maxCustomersPerOrg) {
        violations.push({
          type: "customers",
          current: customerCount,
          limit: limits.maxCustomersPerOrg,
          message: `There are ${customerCount} customers in your organization.
            \n${targetPlan.toUpperCase()} plan allows up to ${
            limits.maxCustomersPerOrg
          } customers.`,
        });
      }

      if (violations.length !== 0) {
        const errorMessages = violations.map((v) => v.message);
        return {
          success: false,
          error: `Unable to change your plan.\n\n${errorMessages.join("\n\n")}`,
          details: errorMessages,
          violations: violations,
        };
      }
    }

    // ============================== if not downgrade ==============================
    if (currentPlan) {
      // deactivate current subscription
      const deactivated = await deactivateCurrentSubscription(supabase, userId);
      if (!deactivated) {
        return {
          success: false,
          error: "Failed to deactivate current subscription",
        };
      }
    }

    // create new subscription
    const subscriptionData: SubscriptionData = {
      user_id: userId,
      plan_id: targetPlanData.id,
      status: targetPlan === "free" ? "free" : "active",
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      payment_status: targetPlan === "free" ? "paid" : "pending",
    };

    const subscriptionResult = await createSubscription(userId, supabase, subscriptionData);
    if (!subscriptionResult.success) {
      return {
        success: false,
        error: subscriptionResult.error || "Failed to create new subscription",
      };
    }

    return {
      success: true,
      subscriptionId: subscriptionResult.subscriptionId,
    };
  } catch (error) {
    console.error("Error in updateSubscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// 플랜 선택/변경 메인 함수 (subscriptions 테이블 사용)
export const selectPlan = async (
  userId: string,
  targetPlanName: PlanName
): Promise<PlanActionResult> => {
  try {
    const supabase = await createClient();

    // ============================== get current subscription ==============================
    const { data: currentSubData, error: currentSubError } = await supabase
      .from("subscriptions")
      .select(
        `id, plan_id, status, starts_at, ends_at, payment_status, plans (name, max_users, max_customers, email_sender)`
      )
      .eq("user_id", userId)
      .in("status", ["active", "free"])
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentSubError) return { success: false, error: currentSubError.message };

    // to prevent to switch plan within 7 days
    if (currentSubData?.starts_at) {
      const startsAt = new Date(currentSubData.starts_at);
      const now = new Date();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const nextChangeDate = new Date(startsAt.getTime() + sevenDaysMs);

      if (now.getTime() < nextChangeDate.getTime()) {
        return {
          success: false,
          error: `You cannot change your subscription until ${nextChangeDate.toLocaleDateString(
            undefined,
            { year: "numeric", month: "long", day: "numeric" }
          )}. Please try again after this date.`,
        };
      }
    }

    // Handle plans as array (Supabase foreign key relationship returns array)
    const plansArray = Array.isArray(currentSubData?.plans)
      ? currentSubData.plans
      : [currentSubData?.plans];
    const currentPlan = plansArray[0] as PlanType | undefined;

    // check target plan is same as current plan
    if (currentPlan?.name === targetPlanName) {
      return { success: false, error: `You are already subscribed to the ${targetPlanName} plan` };
    }

    // 4. 구독 업데이트 (검증 포함)
    return await updateSubscription(
      supabase,
      userId,
      targetPlanName,
      currentPlan?.name as PlanName
    );
  } catch (error) {
    console.error("Error in selectPlan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const updatePaymentStatus = async (
  userId: string,
  paymentStatus: PaymentStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("subscriptions")
      .update({ payment_status: paymentStatus })
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Error updating payment status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
