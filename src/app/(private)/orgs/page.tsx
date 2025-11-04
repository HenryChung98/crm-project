"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

import { useOrganization } from "@/contexts/OrganizationContext";
import { hasSubscription } from "@/shared-utils/server/has-subscription";
import { ownOrganization } from "@/shared-utils/server/own-organization";
import { useInvitationCheck } from "./invitation/utils/useOrganizationInvitations";

//types
import { OrganizationInvitations } from "@/types/database/organizations";
import { EMPTY_ARRAY } from "@/types/customData";

// ui
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorBanner } from "@/components/ui/QueryErrorBanner";

export default function OrgPage() {
  const router = useRouter();

  // to prevents UI flicker (UX optimization)
  const { orgMemberLoading } = useOrganization();

  const {
    data: orgInvitations = EMPTY_ARRAY,
    isLoading: isInvitationLoading,
    error: invitationError,
    refetch,
  } = useInvitationCheck<OrganizationInvitations>();

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
          <Button onClick={handleCreateOrganizationButton}>create</Button>
          an organization
          <br />
          <SignOutButton />
        </p>
      </div>
    </>
  );
}
