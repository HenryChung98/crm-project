export interface Products {
  id: string;
  sku: string;
  organization_id: string;
  name: string;
  description: string;
  type: "inventory" | "non-inventory" | "service";
  price: number;
  cost: number;
  status: "active" | "inactive" | "discontinued";
  created_by: string;
  created_at: string;
  note?: string | null;
}
