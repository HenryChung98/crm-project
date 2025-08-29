import { SupabaseClient } from "@supabase/supabase-js";
import { PlanName, SubscriptionStatus, PaymentStatus } from "@/types/database/plan";

export interface SubscriptionData {
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at?: string;
  payment_status: PaymentStatus;
}

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  currentPlan?: PlanName;
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  subscriptionEndsAt?: string;
}

// =============================================================================
// 구독 조회 함수들
// =============================================================================

// 현재 활성 구독 조회
export const getCurrentSubscription = async (
  supabase: SupabaseClient,
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ subscription: any; plan: any } | null> => {
  try {
    const query = supabase
      .from("subscriptions")
      .select(
        `
        *,
        plans:plan_id (
          id,
          name,
          max_users,
          max_customers,
          max_organization_num
        )
      `
      )
      .eq("user_id", userId)
      .in("status", ["active", "free"])
      .order("starts_at", { ascending: false })
      .limit(1);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching current subscription:", error);
      return null;
    }

    return data && data.length > 0 ? { subscription: data[0], plan: data[0].plans } : null;
  } catch (error) {
    console.error("Error in getCurrentSubscription:", error);
    return null;
  }
};

// plans 테이블에서 플랜 정보 조회
export const getPlanByName = async (
  supabase: SupabaseClient,
  planName: PlanName
): Promise<{ id: string } | null> => {
  try {
    const { data: plan, error } = await supabase
      .from("plans")
      .select("id")
      .eq("name", planName)
      .single();

    if (error) {
      console.error("Error fetching plan:", error);
      return null;
    }

    return plan;
  } catch (error) {
    console.error("Error in getPlanByName:", error);
    return null;
  }
};

// =============================================================================
// 구독 조작 함수들
// =============================================================================

// 기존 구독 비활성화
export const deactivateCurrentSubscription = async (
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        ends_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .in("status", ["active", "free"])
      .select();

    if (error) {
      console.error("Error deactivating subscription:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deactivateCurrentSubscription:", error);
    return false;
  }
};

// 새 구독 생성
export const createSubscription = async (
  supabase: SupabaseClient,
  subscriptionData: SubscriptionData
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([subscriptionData])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating subscription:", error);
      return { success: false, error: error.message };
    }

    return { success: true, subscriptionId: data.id };
  } catch (error) {
    console.error("Error in createSubscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// 구독 상태 확인
export const getSubscriptionStatus = async (
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> => {
  try {
    const subscriptionData = await getCurrentSubscription(supabase, userId);

    if (!subscriptionData) {
      return { hasActiveSubscription: false };
    }

    return {
      hasActiveSubscription: true,
      currentPlan: subscriptionData.plan.name as PlanName,
      subscriptionStatus: subscriptionData.subscription.subscription_status,
      paymentStatus: subscriptionData.subscription.payment_status,
      subscriptionEndsAt: subscriptionData.subscription.subscription_ends_at,
    };
  } catch (error) {
    console.error("Error in getSubscriptionStatus:", error);
    return { hasActiveSubscription: false };
  }
};

// 구독 결제 상태 업데이트
export const updatePaymentStatus = async (
  supabase: SupabaseClient,
  userId: string,
  paymentStatus: PaymentStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    const query = supabase
      .from("subscriptions")
      .update({ payment_status: paymentStatus })
      .eq("user_id", userId)
      .eq("status", "active");

    const { error } = await query;

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
