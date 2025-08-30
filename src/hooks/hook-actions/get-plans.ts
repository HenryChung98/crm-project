"use server";

import { SubscribedPlan } from "@/types/database/plan";
import { createClient } from "@/utils/supabase/server";

export async function getPlanByUser(): Promise<SubscribedPlan> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(`*, plans (*)`)
    .eq("user_id", user.id)
    .single();

  if (subscriptionError) {
    // PGRST116 에러는 데이터가 없는 경우이므로 별도 처리
    if (subscriptionError.code === "PGRST116") {
      throw new Error("No subscription found for user");
    }
    throw subscriptionError;
  }

  if (!subscriptionData) {
    throw new Error("No subscription found for user");
  }

  // plans 데이터 유효성 검사 추가
  if (!subscriptionData.plans) {
    throw new Error("Plan data not found");
  }

  // plans가 배열로 반환되므로 첫 번째 요소를 사용
  const planData = Array.isArray(subscriptionData.plans) ? subscriptionData.plans[0] : subscriptionData.plans;

  if (!planData) {
    throw new Error("Plan details not found");
  }

  return {
    plans: planData,
    subscription: subscriptionData,
  } as SubscribedPlan;
}

export async function getPlanByOrg(orgId?: string): Promise<SubscribedPlan | null> {
  if (!orgId) return null;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // 조직 정보 조회
  const { data: org, error: orgFetchError } = await supabase
    .from("organizations")
    .select("created_by")
    .eq("id", orgId)
    .single();

  if (orgFetchError) {
    if (orgFetchError.code === "PGRST116") {
      throw new Error("Organization not found");
    }
    throw new Error(`Failed to fetch organization: ${orgFetchError.message}`);
  }

  if (!org || !org.created_by) {
    throw new Error("Organization not found or invalid");
  }

  // 조직 소유자의 구독 정보 조회
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(`*, plans (*)`)
    .eq("user_id", org.created_by)
    .single();

  if (subscriptionError) {
    if (subscriptionError.code === "PGRST116") {
      throw new Error("No subscription found for organization owner");
    }
    throw subscriptionError;
  }

  if (!subscriptionData) {
    throw new Error("No subscription found for organization owner");
  }

  // plans 데이터 유효성 검사 추가
  if (!subscriptionData.plans) {
    throw new Error("Plan data not found for organization");
  }

  // plans가 배열로 반환되므로 첫 번째 요소를 사용
  const planData = Array.isArray(subscriptionData.plans)
    ? subscriptionData.plans[0]
    : subscriptionData.plans;

  if (!planData) {
    throw new Error("Plan details not found for organization");
  }

  return {
    plans: planData,
    subscription: subscriptionData,
  } as SubscribedPlan;
}
