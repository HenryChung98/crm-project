import { SupabaseClient } from "@supabase/supabase-js";
import { ValidationViolation, validatePlanChange, isDowngrade } from "./plan-validation";
import {
  getCurrentSubscription,
  deactivateCurrentSubscription,
  createSubscription,
  getPlanByName,
  SubscriptionData,
} from "./subscription-management";
import { PlanName, PaymentStatus } from "@/types/database/plan";

export interface PlanActionResult {
  success: boolean;
  error?: string;
  details?: string[];
  violations?: ValidationViolation[];
  subscriptionId?: string;
}

// =============================================================================
// 구독 업데이트 (내부 함수)
// =============================================================================

const updateSubscription = async (
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  targetPlan: PlanName,
  currentPlan?: PlanName
): Promise<PlanActionResult> => {
  try {
    // 플랜 변경 검증 (다운그레이드인 경우에만)
    if (currentPlan && isDowngrade(currentPlan, targetPlan)) {
      const validation = await validatePlanChange(supabase, userId, targetPlan, currentPlan);

      if (!validation.isValid) {
        const errorMessages = validation.violations.map((v) => v.message);
        return {
          success: false,
          error: `Unable to change your plan.\n\n${errorMessages.join("\n\n")}`,
          details: errorMessages,
          violations: validation.violations,
        };
      }
    }

    // 1. 기존 활성 구독 비활성화
    const deactivated = await deactivateCurrentSubscription(supabase, userId);
    if (!deactivated) {
      return {
        success: false,
        error: "Failed to deactivate current subscription",
      };
    }

    // 2. 새 구독 생성
    const subscriptionData: SubscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: targetPlan === "free" ? "free" : "active",
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      payment_status: targetPlan === "free" ? "paid" : "pending",
    };

    const subscriptionResult = await createSubscription(supabase, subscriptionData);
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

// =============================================================================
// 메인 플랜 선택/변경 함수
// =============================================================================

// 플랜 선택/변경 메인 함수 (subscriptions 테이블 사용)
export const selectPlan = async (
  supabase: SupabaseClient,
  userId: string,
  planName: PlanName
): Promise<PlanActionResult> => {
  try {
    // 1. 현재 활성 구독 정보 가져오기
    const currentSubscriptionData = await getCurrentSubscription(supabase, userId);
    const currentPlan = currentSubscriptionData?.plan?.name as PlanName | undefined;

    // 2. 타겟 플랜 정보 가져오기
    const plan = await getPlanByName(supabase, planName);
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // 3. 같은 플랜인지 확인
    if (currentPlan === planName) {
      return {
        success: false,
        error: `You are already subscribed to the ${planName} plan`,
      };
    }

    // 4. 구독 업데이트 (검증 포함)
    return await updateSubscription(supabase, userId, plan.id, planName, currentPlan);
  } catch (error) {
    console.error("Error in selectPlan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
