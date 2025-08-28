"use client";

import { useState } from "react";
import { inviteUser } from "./action";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { useSearchParams } from "next/navigation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showError, showSuccess } from "@/utils/feedback";
// type
import { EMPTY_ARRAY } from "@/types/customData";

interface OrgMember {
  organization_id: string;
  organization_name: string;
}

export default function InviteMemberForm() {
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  const { data: orgMembers = EMPTY_ARRAY } = useAllOrganizationMembers<OrgMember>(`
    organization_id, organization_name
  `);

  const currentOrg = orgMembers.find((org) => org.organization_id === currentOrgId);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const res = await inviteUser(formData);
      if (res.success) {
        showSuccess("Invitation sent successfully.");
      } else {
        showError(res.error || "Failed to send invitation.");
      }
    } catch (error) {
      showError("An error occured");
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
      </Form>
    </>
  );
}
