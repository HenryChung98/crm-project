export interface OrganizationMembers {
  id: string;
  organization_id: string;
  organization_name: string;
  user_id: string;
  invited_by: string;
  role: string;
  created_at: string;
  user_email: string;
  organizations: {
    name: string;
  } | null;
  subscriptions: {
    plan_id: string | null;
  };
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
