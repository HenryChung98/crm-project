"use client";

import { useEffect, useState } from "react";
import { inviteUser } from "./action";
import { useAuth } from "@/contexts/AuthContext";

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

  // Fetch user's organizations
  useEffect(() => {
    if (!user) return;

    const fetchOrgs = async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id, organization_name")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching orgs:", error.message);
        return;
      }

      setOrgs(data || []);
    };

    fetchOrgs();
  }, [user, supabase]);

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

      <select
        name="orgId"
        required
        className="mt-4 p-2 border rounded text-gray-500 w-full"
      >
        {orgs.map((org) => (
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
