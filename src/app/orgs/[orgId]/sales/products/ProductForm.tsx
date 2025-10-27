// "use client";
import { useState } from "react";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

export interface ProductFormData {
  orgId: string;
  name: string;
  sku: string;
  description: string;
  type: string;
  price: number | null;
  cost: number | null;
  note?: string;
}

interface ProductFormProps {
  currentOrgId: string;
  mode: string;
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProductForm({
  currentOrgId,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      orgId: currentOrgId,
      name: "",
      sku: "",
      description: "",
      type: "" as const,
      price: null,
      cost: null,
      note: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "cost") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit} formTitle={`${mode} product`}>
      <FormField
        label="Product Name"
        name="name"
        type="text"
        placeholder="Product 1"
        value={formData.name}
        onChange={handleChange}
        required
        className="border w-full p-2"
      />
      <FormField
        label="SKU"
        name="sku"
        type="text"
        placeholder="ABC-001"
        value={formData.sku}
        onChange={handleChange}
        required
        className="border w-full p-2"
      />
      <FormField
        label="Description"
        name="description"
        type="text"
        placeholder="desc..."
        value={formData.description}
        onChange={handleChange}
        required
        className="border w-full p-2"
      />
      <Dropdown name="type" value={formData.type} onChange={handleChange} label="Product Type" required>
        <option value="">Select Product Type</option>
        <option value="inventory">Inventory</option>
        <option value="non-inventory">Non-Inventory</option>
        <option value="service">Service</option>
      </Dropdown>
      <FormField
        label="Price"
        name="price"
        type="text"
        placeholder="0"
        value={formData.price?.toString() ?? ""}
        onChange={handleChange}
        required
        className="border w-full p-2"
      />
      <FormField
        label="Cost"
        name="cost"
        type="text"
        placeholder="0"
        value={formData.cost?.toString() ?? ""}
        onChange={handleChange}
        required
        className="border w-full p-2"
      />
      <div>
        Margin:
        {formData.price && formData.cost ? (formData.price - formData.cost).toFixed(2) : "0.00"}
      </div>
      <FormField
        label="Note"
        name="note"
        type="text"
        placeholder="Optional"
        value={formData.note ?? ""}
        onChange={handleChange}
        className="border w-full p-2"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
          ? "Create Customer"
          : "Update Customer"}
      </Button>
    </Form>
  );
}
