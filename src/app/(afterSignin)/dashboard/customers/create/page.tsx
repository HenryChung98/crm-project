"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

interface OrgMember {
  organization_id: string;
  organization_name: string;
}

interface CustomerFormData {
  orgId: string;
  firstName: string;
  lastName: string;
  source: string;
  email?: string | null;
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
  const { data: orgMembers = [] } = useAllOrganizationMembers<OrgMember>(`
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

  const handleSubmit = () => {
    setLoading(true);
  };
  return (
    <>
      <form action={handleSubmit} className="space-y-4 w-1/3 m-auto">
        <span className="text-sm font-medium">add customer to {currentOrg?.organization_name}</span>
        <input type="hidden" name="orgId" value={currentOrgId} />

        <input
          name="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />
        <input
          name="source"
          type="text"
          placeholder="Source"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.firstName}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="phone"
          type="text"
          placeholder="Phone Number"
          value={formData.firstName}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <input
          name="note"
          type="text"
          placeholder="Note"
          value={formData.firstName}
          onChange={handleChange}
          className="border w-full p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>

        {/* {successMessage && <p className="text-green-600">{successMessage}</p>} */}
        {/* {errorMessage && <p className="text-red-600">{errorMessage}</p>} */}
      </form>
    </>
  );
}
