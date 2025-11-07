"use client";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

import { useOrganization } from "@/contexts/OrganizationContext";
import { useInvitationCheck } from "./invitation/utils/useOrganizationInvitations";

//types
import { OrganizationInvitations } from "@/types/database/organizations";
import { EMPTY_ARRAY } from "@/types/customData";

// ui
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorBanner } from "@/components/ui/QueryErrorBanner";

export default function OrgPage() {
  // to prevents UI flicker (UX optimization)
  const { orgMemberLoading } = useOrganization();

  const {
    data: orgInvitations = EMPTY_ARRAY,
    isLoading: isInvitationLoading,
    error: invitationError,
    refetch,
  } = useInvitationCheck<OrganizationInvitations>();

  const hasInvitations = orgInvitations.length > 0;

  // if organization context is loading
  if (orgMemberLoading || isInvitationLoading) {
    return <LoadingSpinner />;
  }

  // if user has an invitation
  if (hasInvitations) {
    return (
      <>
        <div>
          you have {orgInvitations.length == 1 && "an"} invitation{orgInvitations.length > 1 && "s"}
        </div>
        <Link href="/orgs/invitation">view your invitaion{orgInvitations.length > 1 && "s"}</Link>
      </>
    );
  }
  return (
    <>
      {invitationError && <QueryErrorBanner data="invitation" onRetry={() => refetch} />}
      <div className="rounded-lg shadow-sm border p-12 text-center">
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          You currently have no organizations
        </h2>
        <p className="text-text-secondary text-lg">
          Please
          <Link href="/orgs/create-organization" className="text-blue-500">&nbsp;create&nbsp;</Link>
          an organization
          <br />
          <SignOutButton />
        </p>
      </div>
    </>
  );
}
