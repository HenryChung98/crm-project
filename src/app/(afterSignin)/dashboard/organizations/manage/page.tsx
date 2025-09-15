"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { updateMemberRole, removeMember } from "./action";

// ui
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/utils/feedback";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationMembers } from "@/types/database/organizations";

export default function ManageOrganizationPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org");
  const { user } = useAuth();
  const { confirm, ConfirmModal } = useConfirm();

  const [pendingActions, setPendingActions] = useState<Record<string, "updating" | "removing">>({});

  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAdminOrganizationMembers<OrganizationMembers>(
    currentOrgId!,
    ["owner"],
    `
      id, organization_id, role, user_id, user_email,
      organizations:organization_id(name)
    `,
    { enabled: !!currentOrgId }
  );

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    confirm(
      async () => {
        setPendingActions((prev) => ({ ...prev, [memberId]: "updating" }));

        try {
          const formData = new FormData();
          formData.append("memberId", memberId);
          formData.append("role", newRole);
          formData.append("organizationId", currentOrgId!);

          const result = await updateMemberRole(currentOrgId!, formData);

          if (result.success) {
            showSuccess("Role updated successfully!");
            refetch();
          } else {
            showError(`Failed to update role: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while updating the role");
        } finally {
          setPendingActions((prev) => {
            const { [memberId]: _, ...rest } = prev;
            return rest;
          });
        }
      },
      {
        title: "Update Role",
        message: "Are you sure you want to update this member's role?",
        confirmText: "Update",
        variant: "default",
      }
    );
  };

  const handleRemove = async (memberId: string) => {
    confirm(
      async () => {
        setPendingActions((prev) => ({ ...prev, [memberId]: "removing" }));

        try {
          const formData = new FormData();
          formData.append("removeId", memberId);
          formData.append("organizationId", currentOrgId!);

          const result = await removeMember(formData);

          if (result.success) {
            showSuccess("Member removed successfully!");
            refetch();
          } else {
            showError(`Failed to remove member: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing the member");
        } finally {
          setPendingActions((prev) => {
            const { [memberId]: _, ...rest } = prev;
            return rest;
          });
        }
      },
      {
        title: "Remove Member",
        message: "Are you sure you want to remove this member? This action cannot be undone.",
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  // Filter out current user's member data
  const otherMembers = orgMembers.filter((member) => member.user_id !== user?.id);

  if (isLoading) {
    return <div className="p-6">Loading organization members...</div>;
  }

  if (error) {
    if (error.message.includes("User not authenticated")) {
      return <div className="p-6">Please log in to view this page.</div>;
    }
    if (error.message.includes("permission required")) {
      return <div className="p-6">Access denied - Owner role required</div>;
    }
    return <div className="p-6">Error loading members: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Manage {orgMembers[0]?.organizations?.name || currentOrgId}
        </h1>
        <button className="border rounded p-2" onClick={refetch} disabled={isFetching}>
          {isFetching ? "Loading..." : "Refresh"}
        </button>
      </div>

      {otherMembers.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-2">
            <h3 className="text-lg font-medium mb-2">No other members</h3>
            <p className="text-text-secondary">
              You are currently the only member in this organization. Invite others to collaborate.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {otherMembers.map((member) => (
            <div key={member.id} className="p-4 border rounded">
              <h3 className="font-semibold">User: {member.user_id}</h3>
              <h3 className="font-semibold">Email: {member.user_email}</h3>
              <p className="mb-3">Role: {member.role}</p>

              <div className="flex items-center gap-4">
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
                    <span className="text-sm">Updating...</span>
                  )}
                </div>

                <Button
                  variant="danger"
                  onClick={() => handleRemove(member.id)}
                  disabled={pendingActions[member.id] === "removing"}
                >
                  {pendingActions[member.id] === "removing" ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal />
    </div>
  );
}
