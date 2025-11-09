"use server";

import { createClient } from "@/supabase/server";
import { PlanType, SubscriptionStatus, PaymentStatus } from "@/types/database/plan";

export interface CheckPlanType {
  id: string;
  subscription: {
    status: SubscriptionStatus;
    starts_at: string;
    ends_at: string;
    payment_status: PaymentStatus;
    plan: PlanType;
  };
}

export async function checkPlan(orgId?: string): Promise<CheckPlanType | null> {
  if (!orgId) return null;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // get organizations, subscriptions, plans table
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
    id,
    subscription:subscription_id(
      status,
      starts_at,
      ends_at,
      payment_status,
      plan:plan_id(
        name,
        max_users,
        max_customers,
        email_sender
      )
    )
  `
    )
    .eq("id", orgId)
    .single();

  if (error || !data) throw new Error("Organization not found");

  // Validate the shape of 'data' before returning, converting subscription array to object if necessary
  if (!data || !data.subscription || !data.id) {
    throw new Error("Invalid data format from database");
  }

  const subscriptionArray = Array.isArray(data.subscription)
    ? data.subscription
    : [data.subscription];

  // starts_at 기준으로 최신 subscription 선택
  const latestSubscription = subscriptionArray.sort(
    (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  )[0];

  return {
    id: data.id,
    subscription: {
      ...latestSubscription,
      plan: Array.isArray(latestSubscription.plan)
        ? latestSubscription.plan[0]
        : latestSubscription.plan,
    },
  };
}
