"use server";
import { SubscribedPlan } from "../../types/database/plan";
import { createClient } from "../supabase/server";

export async function checkPlan(orgId?: string): Promise<SubscribedPlan | null> {
  if (!orgId) return null;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // check organization
  const { data: org, error: orgFetchError } = await supabase
    .from("organizations")
    .select("created_by")
    .eq("id", orgId)
    .single();

  if (orgFetchError || !org?.created_by) {
    throw new Error("Organization not found");
  }

  // check owner's subscription's status
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select(`*, plans (*)`)
    .eq("user_id", org.created_by)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) throw subscriptionError;
  if (!subscriptionData?.plans) {
    throw new Error("No subscription found for organization owner");
  }

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
