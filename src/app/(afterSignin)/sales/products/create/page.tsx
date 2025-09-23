"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createProduct } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";
import { Dropdown } from "@/components/ui/Dropdown";

interface ProductFormData {
  orgId: string;
  name: string;
  sku: string;
  description: string;
  type: "inventory" | "non-inventory" | "service" | "";
  price: number | null;
  cost: number | null;
  note?: string;
}

export default function CreateProductPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    orgId: "",
    name: "",
    sku: "",
    description: "",
    type: "",
    price: null,
    cost: null,
    note: "",
  });
  // =============================for form=============================
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "price" || name === "cost") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setButtonLoading(true);
    try {
      const res = await createProduct(formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to create product");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });

        showSuccess("Product successfully created");
      }
    } catch (error) {
      showError("An error occurred.");
    } finally {
      setButtonLoading(false);
    }
  };
  // =============================/for form=============================

  return (
    <>
      <Form action={handleSubmit} formTitle="Create Product">
        <input type="hidden" name="orgId" value={currentOrgId} />
        <FormField
          label="Product Name"
          name="name"
          type="text"
          placeholder="Product 1"
          value={formData.name}
          onChange={handleChange}
          required
          requiredField
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
          requiredField
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
          requiredField
          className="border w-full p-2"
        />
        <Dropdown name="type" value={formData.type} onChange={handleChange} required>
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
          requiredField
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
          requiredField
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
        <Button type="submit" disabled={buttonLoading}>
          {buttonLoading ? "Adding..." : "Add Product"}
        </Button>
      </Form>
    </>
  );
}
