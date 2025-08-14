"use client";

import { useState } from "react";
import { inviteUser } from "./action";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { useSearchParams } from "next/navigation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

interface OrgMember {
  organization_id: string;
  organization_name: string;
}

export default function InviteMemberForm() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  const { data: orgMembers = [] } = useAllOrganizationMembers<OrgMember>(`
    organization_id, organization_name
  `);

  const currentOrg = orgMembers.find((org) => org.organization_id === currentOrgId);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await inviteUser(formData);
      if (res.success) {
        setSuccessMessage("Invitation sent successfully.");
      } else {
        setErrorMessage(res.error || "Failed to send invitation.");
      }
    } catch (error) {
      setErrorMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrgId) {
    return <div className="text-center text-red-600">No organization selected</div>;
  }

  return (
    <>
      <Form action={handleSubmit} formTitle={`Invite to ${currentOrg?.organization_name}`}>
        <input type="hidden" name="orgId" value={currentOrgId} />
        <FormField label="Email" type="email" name="email" required />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Invite"}
        </Button>
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </Form>
    </>
  );
}
