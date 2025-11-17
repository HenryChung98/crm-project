export interface DealType {
  id: string;
  name: string;
  organization_id: string;
  owner_id: string;
  contact_id: string;
  product_id: string;
  stage: "" | "lead" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  created_at: string;
  closed_at: string;
  note: string;
  contact: {
    id: string;
    name: string;
    email: string;
    status: "lead" | "customer" | "inactive";
    jobTitle: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    status: "active" | "inactive" | "discontinued";
  };
}
