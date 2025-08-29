"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { createCustomer } from "./action";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";

// type
import { EMPTY_ARRAY } from "@/types/customData";

interface OrgMember {
  organization_id: string;
  organization_name: string;
}

interface CustomerFormData {
  orgId: string;
  firstName: string;
  lastName: string;
  source: string;
  email: string;
  phone?: string | null;
  note?: string | null;
}

export default function CreateCustomersPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const [formData, setFormData] = useState<CustomerFormData>({
    orgId: "",
    firstName: "",
    lastName: "",
    source: "",
    email: "",
    phone: "",
    note: "",
  });

  // fetch customer infos
  const { data: orgMembers = EMPTY_ARRAY } = useAllOrganizationMembers<OrgMember>(`
    organization_id, organization_name
    `);
  const currentOrg = orgMembers.find((org) => org.organization_id === currentOrgId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const res = await createCustomer(formData);
      if (res.success) {
        showSuccess("Customer added successfully.");
      } else {
        showError(res.error || "Failed to add customer.");
      }
    } catch (error) {
      showError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Form action={handleSubmit} formTitle={`add customer to ${currentOrg?.organization_name}`}>
        <input type="hidden" name="orgId" value={currentOrgId} />
        <FormField
          label="First Name"
          name="firstName"
          type="text"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <FormField
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <FormField
          label="Source"
          name="source"
          type="text"
          placeholder="By SNS"
          value={formData.source}
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
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add customer"}
        </Button>
      </Form>
    </>
  );
}
