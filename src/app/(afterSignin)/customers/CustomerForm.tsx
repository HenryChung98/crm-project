// "use client";
import { useState } from "react";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export interface CustomerFormData {
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  note?: string | null;
}

interface CustomerFormProps {
  currentOrgId: string;
  mode: string;
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading: boolean;
}

export function CustomerForm({
  currentOrgId,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      orgId: currentOrgId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      note: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit} formTitle={`${mode} customer`}>
      <FormField
        label="First Name"
        name="firstName"
        placeholder="John"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <FormField
        label="Last Name"
        name="lastName"
        placeholder="Doe"
        value={formData.lastName}
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
      />
      <FormField
        label="Phone"
        name="phone"
        type="text"
        placeholder="1234567890"
        value={formData.phone ?? ""}
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

      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
          ? "Create Customer"
          : "Update Customer"}
      </Button>
      {/* {mode === "create" || <Button type="submit" variant="danger">Delete</Button>} */}
    </Form>
  );
}
