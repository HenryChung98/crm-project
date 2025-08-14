"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { updateMemberRole, removeMember } from "./action";

// ui
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmModal";

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
  const { confirm, ConfirmModal } = useConfirm();

  const [pendingActions, setPendingActions] = useState<Record<string, "updating" | "removing">>({});

  const {
    data: orgMembers = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAdminOrganizationMembers<OrgMember>(
    currentOrgId!,
    ["owner"],
    `
      id, organization_id, role, user_id, user_email,
      organizations:organization_id(name)
    `,
    { enabled: !!currentOrgId }
  );

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    confirm(async () => {
      setPendingActions((prev) => ({ ...prev, [memberId]: "updating" }));

      try {
        const formData = new FormData();
        formData.append("memberId", memberId);
        formData.append("role", newRole);
        formData.append("organizationId", currentOrgId!);

        const result = await updateMemberRole(currentOrgId!, formData);

        if (result.success) {
          alert("Role updated successfully!");
          refetch();
        } else {
          alert(`Failed to update role: ${result.error}`);
        }
      } catch (error) {
        alert("An error occurred while updating the role");
      } finally {
        setPendingActions((prev) => {
          const { [memberId]: _, ...rest } = prev;
          return rest;
        });
      }
    }, {
      title: "Update Role",
      message: "Are you sure you want to update this member's role?",
      confirmText: "Update",
      variant: "default"
    });
  };

  const handleRemove = async (memberId: string) => {
    confirm(async () => {
      setPendingActions((prev) => ({ ...prev, [memberId]: "removing" }));

      try {
        const formData = new FormData();
        formData.append("removeId", memberId);
        formData.append("organizationId", currentOrgId!);

        const result = await removeMember(formData);

        if (result.success) {
          alert("Member removed successfully!");
          refetch();
        } else {
          alert(`Failed to remove member: ${result.error}`);
        }
      } catch (error) {
        alert("An error occurred while removing the member");
      } finally {
        setPendingActions((prev) => {
          const { [memberId]: _, ...rest } = prev;
          return rest;
        });
      }
    }, {
      title: "Remove Member",
      message: "Are you sure you want to remove this member? This action cannot be undone.",
      confirmText: "Remove",
      variant: "danger"
    });
  };

  if (isLoading) {
    return <div>Loading organization members...</div>;
  }

  if (error) {
    if (error.message.includes("User not authenticated")) {
      return <div>Please log in to view this page.</div>;
    }
    if (error.message.includes("permission required")) {
      return <div>Access denied - Owner role required</div>;
    }
    return <div>Error loading members: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Manage {orgMembers[0]?.organizations?.name || currentOrgId}
      </h1>
      <button className="border rounded p-2 m-2" onClick={refetch}>
        {isFetching ? "loading.." : "refresh"}
      </button>
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
                  disabled={pendingActions[member.id] === "updating"}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                {pendingActions[member.id] === "updating" && (
                  <span className="text-sm text-gray-500">Updating...</span>
                )}
              </div>

              <Button
                variant="danger"
                onClick={() => handleRemove(member.id)}
                disabled={pendingActions[member.id] === "removing"}
              >
                {pendingActions[member.id] === "removing" ? "deleting..." : "delete"}
              </Button>
            </div>
          ) : null
        )}
      </div>
      
      <ConfirmModal />
    </div>
  );
}