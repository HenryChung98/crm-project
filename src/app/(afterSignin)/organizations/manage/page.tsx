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
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationMembers } from "@/types/database/organizations";

export default function ManageOrganizationPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org");
  const { user } = useAuth();
  const { confirm, ConfirmModal } = useConfirm();
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: isLoadingMembers,
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
        setIsUpdateLoading(true);
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
          showError("An error occurred while updating");
        } finally {
          setIsUpdateLoading(false);
        }
      },
      {
        title: "Update Role",
        message: "Are you sure you want to update this member's role?",
        confirmText: "Update",
        variant: "primary",
      }
    );
  };

  const handleRemove = async (memberId: string) => {
    confirm(
      async () => {
        setIsUpdateLoading(true);
        try {
          const result = await removeMember(memberId, currentOrgId!);

          if (result.success) {
            showSuccess("Member removed successfully!");
            refetch();
          } else {
            showError(`Failed to remove member: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove member error:", error); // 디버깅용
        } finally {
          setIsUpdateLoading(false);
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

  const otherMembers = orgMembers.filter((member) => member.user_id !== user?.id);

  if (isLoadingMembers) return <FetchingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <QueryErrorUI error={error} onRetry={refetch} />
      </div>
    );
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
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  disabled={isUpdateLoading}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>

                <Button
                  variant="danger"
                  onClick={() => handleRemove(member.id)}
                  disabled={isUpdateLoading}
                >
                  {isUpdateLoading ? "Processing..." : "Delete"}
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
