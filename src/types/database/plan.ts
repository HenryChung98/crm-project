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
  id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string;
  payment_status: PaymentStatus;
  plan: PlanType;
}

export interface PlanType {
  name: string;
  max_users: number;
  max_customers: number;
  email_sender: number;
}

export type PlanName = "free" | "basic" | "premium";
export type SubscriptionStatus = "free" | "active" | "inactive" | "canceled" | "expired";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
