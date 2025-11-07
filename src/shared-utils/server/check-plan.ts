"use server";

import { createClient } from "../supabase/server";

export interface CheckPlanType {
  id: string;
  subscription: {
    status: "free" | "active" | "inactive" | "canceled" | "expired";
    ends_at: string;
    payment_status: "paid" | "pending" | "failed" | "refunded";
    plan: {
      name: string;
      max_users: number;
      max_customers: number;
      email_sender: number;
    };
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
      "id, subscription:subscription_id(status, ends_at, payment_status, plan:plan_id(name, max_users, max_customers, email_sender))"
    )
    .eq("id", orgId)
    .single();

  if (error) {
    throw new Error("Organization not found");
  }

  // Validate the shape of 'data' before returning, converting subscription array to object if necessary
  if (!data || !data.subscription || !data.id) {
    throw new Error("Invalid data format from database");
  }

  // Supabase may return "subscription" as an array due to join. If so, take the first element.
  const subscription = Array.isArray(data.subscription) ? data.subscription[0] : data.subscription;

  // Handle the case where 'plan' might be an array and transform it to a single object
  const plan = Array.isArray(subscription.plan) ? subscription.plan[0] : subscription.plan;

  return {
    id: data.id,
    subscription: {
      ...subscription,
      plan: plan,
    },
  };
}
