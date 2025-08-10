"use client";
import { useSearchParams } from "next/navigation";
import {
  useAdminOrganizationMembers,
  useAdminUpdateOrganizationMember,
  useRemoveOrganizationMember,
} from "@/hooks/tanstack/useOrganizationMembers";
import { useAuth } from "@/contexts/AuthContext";

type OrgMember = {
  id: string;
  user_id: string;
  user_email: string;
  organization_id: string;
  role: string;
  organizations: {
    name: string | null;
  } | null;
};

export default function ManageOrganizationPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org");
  const { user } = useAuth();

  const {
    data: orgMembers = [],
    isLoading,
    error,
  } = useAdminOrganizationMembers<OrgMember>(
    currentOrgId!,
    `
      id, organization_id, role, user_id, user_email,
      organizations:organization_id(name)
    `,
    { enabled: !!currentOrgId }
  );

  const updateMember = useAdminUpdateOrganizationMember();

  const handleUpdateRole = (memberId: string, newRole: string) => {
    if (window.confirm("you sure?")) {
      updateMember.mutate(
        {
          updateId: memberId,
          updates: { role: newRole },
          organizationId: currentOrgId!,
        },
        {
          onError: (error) => {
            alert(`Failed to remove: ${error.message}`);
          },
          onSuccess: () => {
            alert("updated.");
          },
        }
      );
    }
  };

  // remove user
  const removeMember = useRemoveOrganizationMember();

  const handleRemove = (id: string) => {
    if (window.confirm("you sure?")) {
      removeMember.mutate(
        { removeId: id, organizationId: currentOrgId! },
        {
          onError: (error) => {
            alert(`Failed to remove: ${error.message}`);
          },
          onSuccess: () => {
            alert("the member is fired.");
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>Loading organization members...</div>;
  }

  if (error) {
    if (error.message.includes("User not authenticated")) {
      return <div>Please log in to view this page.</div>;
    }
    if (error.message.includes("Admin permission required")) {
      return <div>Access denied - Admin role required</div>;
    }
    return <div>Error loading members: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Manage {orgMembers[0]?.organizations?.name || currentOrgId}
      </h1>

      <div className="mb-4 p-4 rounded">
        <h3 className="font-semibold mb-2">Current User Info:</h3>
        <p>User ID: {user?.id}</p>
        <p>Current Org ID: {currentOrgId}</p>
        <p>Your Role: {orgMembers.find((m) => m.user_id === user?.id)?.role || "Unknown"}</p>
      </div>

      <div className="grid gap-4">
        {orgMembers.map((member) =>
          member.user_id !== user?.id ? (
            <div key={member.id} className="p-4 border rounded">
              <h3 className="font-semibold">User: {member.user_id}</h3>
              <h3 className="font-semibold">email: {member.user_email}</h3>
              <p className="text-gray-600">Role: {member.role}</p>

              <div className="flex items-center gap-2">
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  disabled={updateMember.isPending}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {updateMember.isPending && (
                  <span className="text-sm text-gray-500">Updating...</span>
                )}
              </div>

              <button
                onClick={() => handleRemove(member.id)}
                disabled={removeMember.isPending}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {removeMember.isPending ? "deleting..." : "delete"}
              </button>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
