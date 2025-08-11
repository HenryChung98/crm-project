"use client";

import { useState } from "react";
import { inviteUser } from "./action";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { useSearchParams } from "next/navigation";

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
      <form action={handleSubmit} className="space-y-4 w-1/3 m-auto">
        <label className="block">
          <span className="text-sm font-medium">Invite to {currentOrg?.organization_name}</span>
          <input
            type="email"
            name="email"
            required
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </label>

        <input type="hidden" name="orgId" value={currentOrgId} />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invite"}
        </button>

        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </form>
    </>
  );
}
