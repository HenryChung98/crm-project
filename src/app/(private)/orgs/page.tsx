"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton } from "@/app/auth/SignOutButton";
import { JoinOrganizationButton } from "./invitation/JoinOrganizationButton";

import { useOrganization } from "@/contexts/OrganizationContext";
import { hasSubscription } from "@/shared-hooks/server/has-subscription";
import { ownOrganization } from "@/shared-hooks/server/own-organization";
import { useInvitationCheck } from "./invitation/useOrganizationInvitations";

//types
import { OrganizationInvitations } from "@/types/database/organizations";
import { EMPTY_ARRAY } from "@/types/customData";

// ui
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function OrgPage() {
  const router = useRouter();
  const { isLoading } = useOrganization();

  const { data: orgInvitations = EMPTY_ARRAY, isLoading: isInvitationLoading } =
    useInvitationCheck<OrganizationInvitations>();

  const hasInvitations = orgInvitations.length > 0;

  // create organization button function
  const handleCreateOrganizationButton = async () => {
    // check user own organization
    const own = await ownOrganization();
    // check user has subscription
    const has = await hasSubscription();

    if (own) {
      router.push(`orgs/${own}/dashboard`);
    } else if (has) {
      router.push("/orgs/create-organization");
    } else {
      router.push("/subscription");
    }
  };

  // if organization context is loading
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // if user has an invitation
  if (hasInvitations) {
    return <>you have an invitation</>;
  }
  return (
    <>
      <div className="rounded-lg shadow-sm border p-12 text-center">
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          You currently have no organizations
        </h2>
        <p className="text-text-secondary text-lg">
          Please
          <Button onClick={handleCreateOrganizationButton}>create</Button>
          or join an organization
          <br />
          <SignOutButton />
          <br />
          <Link href="orgs/profile">profile</Link>
          <br />
          <Link href="orgs/profile/edit">edit profile</Link>
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
