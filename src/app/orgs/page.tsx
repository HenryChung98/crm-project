"use client";
import Link from "next/link";

import { useOrganizationInvitationsByEmail } from "./useOrganizationInvitations";
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationInvitations } from "@/types/database/organizations";
import { JoinOrganizationButton } from "@/app/orgs/JoinOrganizationButton";

export default function OrgPage() {
  const { data: orgInvitations = EMPTY_ARRAY, isLoading: isInvitationLoading } =
    useOrganizationInvitationsByEmail<OrganizationInvitations>();

  const hasInvitations = orgInvitations.length > 0;

  return (
    <>
      <div className="rounded-lg shadow-sm border p-12 text-center">
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          You currently have no organizations
        </h2>
        <p className="text-text-secondary text-lg">
          Please
          <Link href="/organizations/create" className="text-blue-500">
            &nbsp;create&nbsp;
          </Link>
          or join an organization
        </p>
      </div>
      {isInvitationLoading && (
        <div className="mt-8 border border-blue-200 rounded-lg p-6">
          <div className="text-blue-700">Loading invitations...</div>
        </div>
      )}
      {hasInvitations && (
        <div className="mt-8 rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Organization Invitations</h3>
          </div>
          <div className="p-6 space-y-4">
            {orgInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="text-green-800 font-medium mb-3">
                  Invited to: {invitation.organizations?.name || "Unknown Organization"}
                </div>
                <JoinOrganizationButton
                  inviteId={invitation.organization_id}
                  orgName={invitation.organizations?.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
