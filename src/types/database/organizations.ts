import { SubscriptionStatus, PaymentStatus } from "./plan";

export interface OrganizationContextQuery {
  id: string;
  organization_id: string;
  role: RoleName;
  user_email?: string;
  organizations: {
    name: string;
    url: string;
    email?: string;
    phone?: string;
    subscription: {
      id: string;
      plan_id: string;
      status: SubscriptionStatus;
      ends_at: string;
      payment_status: PaymentStatus;
      plan: {
        name: string;
      };
    } | null;
  } | null;
}

export interface OrganizationInvitations {
  id: string;
  organization_id: string;
  email: string;
  accepted: boolean;
  invited_by: string;
  created_at: string;
  expires_at: string;
  organizations: {
    id: string;
    name: string;
  } | null;
}

export type RoleName = "member" | "admin" | "owner";

export const ROLE_HIERARCHY = {
  member: { level: 0, name: "member" },
  admin: { level: 1, name: "admin" },
  owner: { level: 2, name: "owner" },
} as const;