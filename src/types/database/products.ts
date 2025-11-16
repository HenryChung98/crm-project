export interface ProductType {
  id: string;
  sku: string;
  organization_id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  cost: number;
  status: string;
  created_by: string;
  created_at: string;
  note?: string | null;
}
