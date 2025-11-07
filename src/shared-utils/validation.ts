"use server";

import { OrganizationContextQuery } from "../types/database/organizations";
import { checkPlan, CheckPlanType } from "@/shared-utils/server/check-plan";
import { checkCustomersUsage, checkMemberUsage } from "@/shared-utils/server/check-usage";
import type { User } from "@supabase/supabase-js";

export interface PlanValidationOptions {
  orgId: string;
  orgMember: OrganizationContextQuery;
  resourceType: "customers" | "users";
  customErrorMessage?: string;
  user?: User;
}

// check all subscription status
export async function validateSubscription(
  orgId: string
): Promise<{ success: true; orgPlanData: CheckPlanType } | { success: false; error: string }> {
  try {
    const orgPlanData = await checkPlan(orgId);
    if (!orgPlanData?.subscription.plan) {
      return { success: false, error: "Failed to get user plan data" };
    }

    // check if expired
    if (orgPlanData.subscription.status !== "free") {
      const isExpired =
        orgPlanData.subscription.ends_at && new Date(orgPlanData.subscription.ends_at) < new Date();

      if (isExpired) {
        return { success: false, error: "Your current organization plan is expired." };
      }
      if (orgPlanData.subscription.status !== "active") {
        return {
          success: false,
          error:
            "Your organization's current plan status is not active. Please contact support or review your subscription.",
        };
      }

      if (orgPlanData.subscription.payment_status !== "paid") {
        return {
          success: false,
          error:
            "Your organization's subscription payment is incomplete or failed. Please verify your payment details.",
        };
      }
    }

    return { success: true, orgPlanData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function validateMemberCreation(
  orgId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // check expiry and if expired, return success: false
  const result = await validateSubscription(orgId);
  if (!result.success) return result;

  const maxLimit = result.orgPlanData.subscription.plan.max_users || 0;
  const currentTotal = await checkMemberUsage(orgId);

  if ((currentTotal ?? 0) >= maxLimit) {
    return {
      success: false,
      error: `User limit reached. Your current plan allows up to ${maxLimit} members.`,
    };
  }

  return { success: true };
}
