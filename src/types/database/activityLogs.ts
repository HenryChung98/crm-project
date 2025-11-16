export interface ActivityLogType {
    id: string;
    organization_id: string;
    entity_id: string;
    entity_type: string;
    action: string;
    changed_data: JSON;
    created_at: string;
    performed_by: string;
    organization_members: {
      user_email: string;
    };
  }
  