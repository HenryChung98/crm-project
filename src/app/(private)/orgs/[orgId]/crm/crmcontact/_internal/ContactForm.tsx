import { useState } from "react";
import { createContact } from "./server/create-action";
import { useQueryClient } from "@tanstack/react-query";
import { validateContactField } from "./validation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/components/feedback";

interface ContactFormData {
  orgId: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  jobTitle?: string | null;
  note?: string | null;
}

interface ContactFormProps {
  currentOrgId: string;
  setFormCollapsed: () => void;
}

export const ContactForm = ({ currentOrgId, setFormCollapsed }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    orgId: currentOrgId,
    name: "",
    email: "",
    phone: "",
    status: "",
    jobTitle: "",
    note: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateContactField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleCancel = () => {
    confirm(
      () => {
        setFormData({
          orgId: currentOrgId,
          name: "",
          email: "",
          phone: "",
          status: "",
          jobTitle: "",
          note: "",
        });
        setFormCollapsed();
      },
      {
        title: "Cancel Creating Contact",
        message: "Do you want to discard the creation? This action cannot be undone.",
        confirmText: "Discard",
        variant: "danger",
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    confirm(
      async () => {
        setIsButtonLoading(true);
        try {
          const submissionData = new FormData();
          submissionData.append("orgId", formData.orgId);
          submissionData.append("name", formData.name);
          submissionData.append("email", formData.email);
          submissionData.append("status", formData.status);
          if (formData.phone) submissionData.append("phone", formData.phone);
          if (formData.note) submissionData.append("note", formData.note);

          const res = await createContact(submissionData);
          if (res?.error) {
            showError(`Error: ${res.error}` || "Failed to add customer");
          } else {
            await queryClient.invalidateQueries({
              queryKey: ["customers"],
            });
            showSuccess("Customer successfully created");
            setFormData({
              orgId: currentOrgId,
              name: "",
              email: "",
              phone: "",
              status: "",
              jobTitle: "",
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
        title: "Create Customer",
        message: "Do you want to create this contact? This action cannot be undone.",
        confirmText: "Create",
        variant: "primary",
      }
    );
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");

  return (
    <div>
      <Form onSubmit={handleSubmit} formTitle="Create Contact">
        <FormField
          label="Name"
          name="name"
          placeholder="e.g., John Smith"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="john.smith@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Dropdown
          value={formData.status}
          onChange={handleChange}
          label="Status"
          name="status"
          error={errors.status}
          required
        >
          <option value="">Select Status</option>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
          <option value="inactive">Inactive</option>
        </Dropdown>
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="555-123-4567"
          value={formData.phone ?? ""}
          onChange={handleChange}
          error={errors.phone}
        />
        <FormField
          label="Job Title"
          name="jobTitle"
          type="text"
          placeholder="e.g., Software Engineer"
          value={formData.jobTitle ?? ""}
          onChange={handleChange}
        />
        <FormField
          label="Note"
          name="note"
          type="text"
          placeholder="Additional notes (optional)"
          value={formData.note ?? ""}
          onChange={handleChange}
        />
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
