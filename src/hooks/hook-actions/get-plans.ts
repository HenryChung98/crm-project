"use server";

import { SubscribedPlan } from "@/types/plan";
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

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(
      `
    id,
    plan_id,
    plans (*)
  `
    )
    .eq("id", user.id)
    .single();

  if (userError) throw userError;
  if (!userData) throw new Error("User not found");

  // plans가 배열로 반환되므로 첫 번째 요소를 사용
  const planData = Array.isArray(userData.plans) ? userData.plans[0] : userData.plans;

  return {
    id: userData.id,
    plan_id: userData.plan_id,
    plans: planData,
  } as SubscribedPlan;
}

export async function getPlanByOrg(orgPlanId?: string): Promise<SubscribedPlan> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: orgData, error: orgError } = await supabase
    .from("organizations")
    .select(
      `
  id,
  plan_id,
  plans (*)
`
    )
    .eq("id", orgPlanId)
    .single();

  if (orgError) throw orgError;
  if (!orgData) throw new Error("Organization not found");

  // plans가 배열로 반환되므로 첫 번째 요소를 사용
  const planData = Array.isArray(orgData.plans) ? orgData.plans[0] : orgData.plans;

  return {
    id: orgData.id,
    plan_id: orgData.plan_id,
    plans: planData,
  } as SubscribedPlan;
}
