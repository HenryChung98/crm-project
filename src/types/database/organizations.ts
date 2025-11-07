import { SubscriptionStatus, PaymentStatus } from "./plan";

export interface OrganizationContextQuery {
  id: string;
  organization_id: string;
  organization_name: string;
  role: string;
  organizations: {
    name: string;
    url: string;
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
