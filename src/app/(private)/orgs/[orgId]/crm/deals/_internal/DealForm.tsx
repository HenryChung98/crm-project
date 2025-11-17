// DealForm.tsx
import { useState } from "react";
import { createDeal } from "./server/create-action";
import { useQueryClient } from "@tanstack/react-query";
import { validateDealField } from "./validation";

import { useContactsDB } from "../../crmcontact/_internal/useContactsDB";
import { useProductsDB } from "../../../sales/products/_internal/useProductsDB";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/components/feedback";
import { Checkbox } from "@/components/ui/CheckBox";

interface DealFormData {
  orgId: string;
  ownerId: string;
  name: string;
  stage: "" | "lead" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  note?: string | null;
  contactId: string;
  productId: string;
  sendEmail: boolean;
}

interface DealFormProps {
  currentOrgId: string;
  userId: string;
  setFormCollapsed: () => void;
}

export const DealForm = ({ currentOrgId, userId, setFormCollapsed }: DealFormProps) => {
  const [formData, setFormData] = useState<DealFormData>({
    orgId: currentOrgId,
    ownerId: userId,
    name: "",
    stage: "",
    note: "",
    contactId: "",
    productId: "",
    sendEmail: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const queryClient = useQueryClient();

  const { data: contacts } = useContactsDB(currentOrgId);
  const { data: products } = useProductsDB(currentOrgId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateDealField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleCancel = () => {
    confirm(
      () => {
        setFormData({
          orgId: currentOrgId,
          ownerId: userId,
          name: "",
          stage: "",
          note: "",
          contactId: "",
          productId: "",
          sendEmail: false,
        });
        setFormCollapsed();
      },
      {
        title: "Cancel Creating Deal",
        message: "Do you want to discard the creation? This action cannot be undone.",
        confirmText: "Discard",
        variant: "danger",
      }
    );
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, sendEmail: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }

    confirm(
      async () => {
        setIsButtonLoading(true);
        try {
          const submissionData = new FormData();
          submissionData.append("orgId", formData.orgId);
          submissionData.append("ownerId", formData.ownerId);
          submissionData.append("name", formData.name);
          submissionData.append("stage", formData.stage);
          submissionData.append("contactId", formData.contactId);
          submissionData.append("productId", formData.productId);
          submissionData.append("sendEmail", formData.sendEmail.toString());
          if (formData.note) submissionData.append("note", formData.note);

          const res = await createDeal(submissionData);
          if (res?.error) {
            showError(`Error: ${res.error}` || "Failed to add deal");
          } else {
            await queryClient.invalidateQueries({
              queryKey: ["deals"],
            });
            showSuccess("Deal successfully created");
            setFormData({
              orgId: currentOrgId,
              ownerId: userId,
              name: "",
              stage: "",
              note: "",
              contactId: "",
              productId: "",
              sendEmail: false,
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
        title: "Create Deal",
        message: "Do you want to create this deal? This action cannot be undone.",
        confirmText: "Create",
        variant: "primary",
      }
    );
  };

  const hasErrors = Object.values(errors).some((error) => error !== "" && error !== "SILENT_ERROR");

  return (
    <div>
      <Form onSubmit={handleSubmit} formTitle="Create Deal">
        <FormField
          label="Deal Name"
          name="name"
          placeholder="e.g., Q4 Enterprise Contract"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Dropdown
          value={formData.stage}
          onChange={handleChange}
          label="Stage"
          name="stage"
          error={errors.stage}
          required
        >
          <option value="">Select Stage</option>
          <option value="lead">Lead</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed-won">Closed Won</option>
          <option value="closed-lost">Closed Lost</option>
        </Dropdown>
        <Dropdown
          value={formData.contactId}
          onChange={handleChange}
          label="Contact"
          name="contactId"
          error={errors.contactId}
          required
        >
          <option value="">Select Contact</option>
          {contacts?.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name} - {contact.email}
            </option>
          ))}
        </Dropdown>
        <Dropdown
          value={formData.productId}
          onChange={handleChange}
          label="Product"
          name="productId"
          error={errors.productId}
          required
        >
          <option value="">Select Product</option>
          {products?.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${product.price}
            </option>
          ))}
        </Dropdown>
        <FormField
          label="Note"
          name="note"
          type="text"
          placeholder="Additional notes (optional)"
          value={formData.note ?? ""}
          onChange={handleChange}
        />
        <div className="flex items-center gap-2">
          <Checkbox checked={formData.sendEmail} onChange={handleCheckboxChange} />
          <label>Send email notification</label>
        </div>
        <div className="flex justify-between mt-20">
          <Button type="submit" disabled={isButtonLoading || hasErrors}>
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