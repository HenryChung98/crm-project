export interface Plan {
  id: string;
  name: string;
  description: string;
  max_users: number;
  max_contacts: number;
  price_monthly: number;
  price_yearly: number;
  created_at: string;
  updated_at?: string;
}

export interface SubscribedPlan {
  id: string;
  ends_at: string;
  plan: PlanType;
  plan_id?: string;
  status?: SubscriptionStatus;
  starts_at?: string;
  payment_status?: PaymentStatus;
}

export interface PlanType {
  name: string;
  max_users?: number;
  max_contacts?: number;
  email_sender?: number;
  track_visit?: number;
  max_deals?: number;
}

export type PlanName = "free" | "basic" | "premium";
export type SubscriptionStatus = "free" | "active" | "inactive" | "canceled" | "expired";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export const PLAN_HIERARCHY = {
  free: { level: 0, name: "free" },
  basic: { level: 1, name: "basic" },
  premium: { level: 2, name: "premium" },
} as const;