import { useState } from "react";
import { createProduct } from "./server/create-action";
import { useQueryClient } from "@tanstack/react-query";
import { validateProductField } from "./validation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/components/feedback";

interface ProductFormData {
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
  setFormCollapsed: () => void;
}

export const ProductForm = ({ currentOrgId, setFormCollapsed }: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    orgId: currentOrgId,
    name: "",
    sku: "",
    description: "",
    type: "" as const,
    price: null,
    cost: null,
    note: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const queryClient = useQueryClient();

  const validateField = (name: string, value: string | number | null) => {
    const error = validateProductField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCancel = () => {
    confirm(
      () => {
        setFormData({
          orgId: currentOrgId,
          name: "",
          sku: "",
          description: "",
          type: "" as const,
          price: null,
          cost: null,
          note: "",
        });
        setFormCollapsed();
      },
      {
        title: "Cancel Creating Product",
        message: "Do you want to discard the creation? This action cannot be undone.",
        confirmText: "Discard",
        variant: "danger",
      }
    );
  };

  const handleSubmit = async (data: ProductFormData) => {
    confirm(
      async () => {
        setIsButtonLoading(true);

        try {
          const formData = new FormData();
          formData.append("orgId", data.orgId);
          formData.append("name", data.name);
          formData.append("sku", data.sku);
          formData.append("description", data.description);
          formData.append("type", data.type);
          formData.append("price", data.price?.toString() || "0");
          formData.append("cost", data.cost?.toString() || "0");
          if (data.note) formData.append("note", data.note);

          const res = await createProduct(formData);
          if (res?.error) {
            showError(`Error: ${res.error}` || "Failed to add product");
          } else {
            await queryClient.invalidateQueries({
              queryKey: ["products"],
            });
            showSuccess("Product successfully created");
            setFormData({
              orgId: currentOrgId,
              name: "",
              sku: "",
              description: "",
              type: "" as const,
              price: null,
              cost: null,
              note: "",
            });
            setFormCollapsed();
          }
        } catch (error) {
          showError("An error occurred.");
        } finally {
          setIsButtonLoading(false);
        }
      },
      {
        title: "Create Product",
        message: "Do you want to create this product? This action cannot be undone.",
        confirmText: "Create",
        variant: "primary",
      }
    );
  };

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(formData);
        }}
        formTitle="Create Product"
      >
        <FormField
          label="Product Name"
          name="name"
          type="text"
          placeholder="Product 1"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <FormField
          label="SKU"
          name="sku"
          type="text"
          placeholder="ABC-001"
          value={formData.sku}
          onChange={handleChange}
          error={errors.sku}
          required
        />
        <FormField
          label="Description"
          name="description"
          type="text"
          placeholder="desc..."
          value={formData.description}
          onChange={handleChange}
          required
        />
        <Dropdown
          name="type"
          value={formData.type}
          onChange={handleChange}
          label="Product Type"
          required
        >
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
          error={errors.price}
          required
        />
        <FormField
          label="Cost"
          name="cost"
          type="text"
          placeholder="0"
          value={formData.cost?.toString() ?? ""}
          onChange={handleChange}
          required
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
        />
        <div className="flex justify-between mt-20">
          <Button type="submit" disabled={isButtonLoading}>
            {isButtonLoading ? "Loading.." : "Create"}
          </Button>
          <Button variant="danger" type="button" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </Form>
      <ConfirmModal />
    </div>
  );
};
