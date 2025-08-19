// actions/planActions.ts
import { SupabaseClient } from "@supabase/supabase-js";

export type PlanName = "free" | "basic" | "premium";

export interface PlanActionResult {
  success: boolean;
  error?: string;
}

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

export const updateUserPlan = async (
  supabase: SupabaseClient,
  userId: string,
  planId: string
): Promise<PlanActionResult> => {
  try {
    const { error } = await supabase.from("users").upsert({
      id: userId,
      plan_id: planId,
    });

    if (error) {
      console.error("Error updating user plan:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserPlan:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

export const selectPlan = async (
  supabase: SupabaseClient,
  userId: string,
  planName: PlanName
): Promise<PlanActionResult> => {
  try {
    // 1. 플랜 정보 가져오기
    const plan = await getPlanByName(supabase, planName);
    
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // 2. 사용자 플랜 업데이트
    const result = await updateUserPlan(supabase, userId, plan.id);
    
    return result;
  } catch (error) {
    console.error("Error in selectPlan:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};