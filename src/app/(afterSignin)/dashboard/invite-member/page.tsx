"use client";

import { useEffect, useState } from "react";
import { inviteUser } from "./action";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationMembers } from "@/hooks/fetchData/useOrganizationMembers";

interface OrgOption {
  organization_id: string;
  organization_name: string;
}

export default function InviteMemberForm() {
  const { user, supabase } = useAuth();

  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { orgMembers, orgError, isLoading } = useOrganizationMembers();

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

  return (
    <form action={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Invite by email</span>
        <input
          type="email"
          name="email"
          required
          className="w-full mt-1 border rounded px-3 py-2"
        />
      </label>

      {orgMembers.map((membership) => (
        <div key={membership.id} className="text-green-600">
          Role: {membership.role}
        </div>
      ))}
      <select name="orgId" required className="mt-4 p-2 border rounded text-gray-500 w-full">
        {orgMembers.map((org) => (
          <option key={org.organization_id} value={org.organization_id}>
            {org.organization_name || "Unnamed Org"}
          </option>
        ))}
      </select>

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
  );
}
