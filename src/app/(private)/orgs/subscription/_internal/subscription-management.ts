import { SupabaseClient } from "@supabase/supabase-js";
import { PlanName, SubscriptionStatus, PaymentStatus } from "@/types/database/plan";

export interface SubscriptionData {
  user_id: string;
  plan_id: string | null;
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
  userId: string,
  supabase: SupabaseClient,
  subscriptionData: SubscriptionData
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .insert([subscriptionData])
      .select("*")
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      return { success: false, error: subError.message };
    }

    const { error: orgError } = await supabase
      .from("organizations")
      .update({ subscription_id: subData.id })
      .eq("created_by", userId);

    if (orgError) {
      console.error("Error updating organization's subscription:", orgError);
      return { success: false, error: orgError.message };
    }
    return { success: true, subscriptionId: subData.id };
  } catch (error) {
    console.error("Error in createSubscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
