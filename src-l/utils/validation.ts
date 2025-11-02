"use server";

import { OrganizationMembers } from "../types/database/organizations";
import { getPlanByOrg } from "../hooks/hook-actions/get-plans";
import { getUsageForOrg } from "../hooks/hook-actions/get-usage";
import type { User } from "@supabase/supabase-js";

export interface ValidationResult {
  success: boolean;
  error?: string;
}

export interface PlanValidationOptions {
  orgId: string;
  orgMember: OrganizationMembers;
  resourceType: "customers" | "users";
  customErrorMessage?: string;
  user?: User;
}

export interface SubscriptionValidationOptions {
  orgId: string;
  orgMember: OrganizationMembers;
}

/**
 * 구독 만료 여부를 검증합니다.
 * @param options - 검증 옵션
 * @returns ValidationResult
 */
export async function validateSubscriptionExpiry(
  options: SubscriptionValidationOptions
): Promise<ValidationResult> {
  const { orgId, orgMember } = options;

  try {
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { success: false, error: "Failed to get user plan data" };
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

        return { success: false, error: errorMessage };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * 리소스 생성 한도를 검증합니다.
 * @param options - 검증 옵션
 * @returns ValidationResult
 */
export async function validateResourceLimits(
  options: PlanValidationOptions
): Promise<ValidationResult> {
  const { orgId, orgMember, resourceType, customErrorMessage } = options;

  try {
    // get user's current plan using existing action
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { success: false, error: "Failed to get user plan data" };
    }

    // get current usage using existing action
    const currentUsage = await getUsageForOrg(orgId);
    if (!currentUsage) {
      return { success: false, error: "Failed to get current usage data" };
    }

    // check if user can create more resources
    const maxLimit =
      resourceType === "customers"
        ? orgPlanData.plans.max_customers || 0
        : orgPlanData.plans.max_users || 0;

    const currentTotal =
      resourceType === "customers" ? currentUsage.customerTotal : currentUsage.userTotal;

    if (currentTotal >= maxLimit) {
      const resourceName = resourceType === "customers" ? "customers" : "users";
      let errorMessage =
        customErrorMessage ||
        `User limit reached. Your current plan allows up to ${maxLimit} ${resourceName}.`;

      if (orgMember?.role === "owner") {
        errorMessage += `\n\nAs the owner, you can upgrade your plan to increase the limit.`;
      }

      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ===============================================================================================

/**
 * 리소스 생성 전 전체 검증을 수행합니다 (한도 + 구독 만료).
 * @param options - 검증 옵션
 * @returns ValidationResult
 */
export async function validateResourceCreation(
  options: PlanValidationOptions
): Promise<ValidationResult> {
  // 1. 구독 만료 검증
  const subscriptionValidation = await validateSubscriptionExpiry({
    orgId: options.orgId,
    orgMember: options.orgMember,
  });

  if (!subscriptionValidation.success) {
    return subscriptionValidation;
  }

  // 2. 리소스 한도 검증
  const limitValidation = await validateResourceLimits(options);
  if (!limitValidation.success) {
    return limitValidation;
  }

  return { success: true };
}

/**
 * 구독 만료만 검증합니다 (업데이트 작업용).
 * @param options - 검증 옵션
 * @returns ValidationResult
 */
export async function validateForUpdate(
  options: SubscriptionValidationOptions
): Promise<ValidationResult> {
  return validateSubscriptionExpiry(options);
}

/**
 * 특정 플랜이 필요한 작업을 검증합니다.
 * @param orgId - 조직 ID
 * @param requiredPlan - 필요한 플랜 이름
 * @returns ValidationResult
 */
export async function validatePlanAccess(
  orgId: string,
  requiredPlan: string
): Promise<ValidationResult> {
  try {
    const orgPlanData = await getPlanByOrg(orgId);
    if (!orgPlanData?.plans) {
      return { success: false, error: "Failed to get user plan data" };
    }

    if (orgPlanData.plans.name !== requiredPlan) {
      return {
        success: false,
        error: `This feature requires ${requiredPlan} plan. Please upgrade your plan.`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
