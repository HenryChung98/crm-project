import { useState } from "react";
import { createContact } from "../action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/components/feedback";

export interface ContactFormData {
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
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (data: ContactFormData) => {
    confirm(
      async () => {
        setIsButtonLoading(true);
        try {
          const formData = new FormData();
          formData.append("orgId", data.orgId);
          formData.append("name", data.name);
          formData.append("email", data.email);
          formData.append("status", data.status);
          if (data.phone) formData.append("phone", data.phone);
          if (data.note) formData.append("note", data.note);

          const res = await createContact(formData);
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

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(formData);
        }}
        formTitle="Create Contact"
      >
        <FormField
          label="Name"
          name="name"
          placeholder="John"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="example@example.com"
          value={formData.email}
          onChange={handleChange}
          className="border w-full p-2"
          required
        />
        <Dropdown
          value={formData.status}
          onChange={handleChange}
          label="Status"
          name="status"
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
          placeholder="1234567890"
          value={formData.phone ?? ""}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <FormField
          label="Job Title"
          name="jobTitle"
          type="text"
          placeholder="soft engineer"
          value={formData.jobTitle ?? ""}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <FormField
          label="Note"
          name="note"
          type="text"
          placeholder="Any Note"
          value={formData.note ?? ""}
          onChange={handleChange}
          className="border w-full p-2"
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
