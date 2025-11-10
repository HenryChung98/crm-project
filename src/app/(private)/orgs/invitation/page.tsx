"use client";
import { useInvitationCheck } from "./_internal/useOrganizationInvitations";
import { JoinOrganizationButton } from "./_internal/JoinOrganizationButton";

//types
import { OrganizationInvitations } from "@/types/database/organizations";
import { EMPTY_ARRAY } from "@/types/customData";

// ui
import { QueryErrorBanner } from "@/components/ui/QueryErrorBanner";

export default function InvitationPage() {
  const {
    data = EMPTY_ARRAY,
    isLoading,
    error,
    refetch,
  } = useInvitationCheck();

  return (
    <>
      {isLoading && (
        <div className="mt-8 border border-blue-200 rounded-lg p-6">
          <div className="text-blue-700">Loading invitations...</div>
        </div>
      )}
      {error && <QueryErrorBanner data="invitation" onRetry={() => refetch} />}
      <div className="mt-8 rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Organization Invitations</h3>
        </div>
        <div className="p-6 space-y-4">
          {data!.map((invitation) => (
            <div key={invitation.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-medium mb-3">
                Invited to: {invitation.organizations?.name || "Unknown Organization"}
              </div>
              <JoinOrganizationButton
                orgId={invitation.organization_id}
                orgName={invitation.organizations?.name}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
