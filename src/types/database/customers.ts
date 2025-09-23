export interface Customers {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  tag: string;
  created_at: string;
  updated_at: string;
  last_contacted_at: string;
  source: string;
  note: string;
}

export interface CustomerLogs {
  id: string;
  organization_id: string;
  entity_id: string;
  entity_type: string;
  action: string;
  changed_data: JSON;
  performed_at: string;
  performed_by: string;
  organization_members?: {
    user_email: string;
  };
}
