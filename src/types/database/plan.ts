export interface Plan {
  id: string;
  name: string;
  description: string;
  max_users: number;
  max_customers: number;
  price_monthly: number;
  price_yearly: number;
  created_at: string;
  updated_at?: string;
}

export interface SubscribedPlan {
  plans: {
    created_at: string;
    description: string;
    id: string;
    max_customers: number;
    max_organization_num: number;
    max_users: number;
    name: "free" | "active" | "premium";
    price_monthly: number;
    price_yearly: number;
    updated_at: string;
  };
  subscription: {
    id: string;
    user_id: string;
    plan_id: string;
    status: "free" | "active" | "inactive" | "expired" | "canceled";
    starts_at: string;
    ends_at: string;
    payment_status: "paid" | "pending" | "failed" | "refunded";
  };
}

export interface PlanFeature {
  id: string;
  feature: string;
  is_enabled: boolean;
}

export interface FeatureUsage {
  feature_name: string;
  current_usage: number;
  period_start: string;
  period_end: string;
}

export type PlanName = "free" | "basic" | "premium";
export type SubscriptionStatus =
  | "free"
  | "active"
  | "inactive"
  | "canceled"
  | "expired"
  | "pending";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
