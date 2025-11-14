export interface ContactType {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
  source: string;
  note: string;
  imported_data?: JSON;
  status: "lead" | "customer" | "inactive";
}
