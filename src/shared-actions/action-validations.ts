"use server";

import { OrganizationContextQuery } from "@/types/database/organizations";
import { CheckPlanType, checkPlan } from "@/shared-actions/check-plan";
import { checkMemberUsage, checkContactUsage } from "./check-usage";
import type { User } from "@supabase/supabase-js";
import { isExpired } from "@/shared-utils/validations";

export interface PlanValidationOptions {
  orgId: string;
  orgMember: OrganizationContextQuery;
  contactErrorMessage?: string;
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
      if (isExpired(orgPlanData.subscription.ends_at)) {
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


export async function validateContactCreation(
  orgId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // check expiry and if expired, return success: false
  const result = await validateSubscription(orgId);
  if (!result.success) return result;

  const maxLimit = result.orgPlanData.subscription.plan.max_contacts || 0;
  const currentTotal = await checkContactUsage(orgId);

  if ((currentTotal ?? 0) >= maxLimit) {
    return {
      success: false,
      error: `User limit reached. Your current plan allows up to ${maxLimit} contacts.`,
    };
  }

  return { success: true };
}