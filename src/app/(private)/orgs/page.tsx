"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EMPTY_ARRAY } from "@/types/customData";

import { SignOutButton } from "@/app/auth/SignOutButton";

import { hasSubscription } from "@/shared-hooks/server/has-subscription";
import { ownOrganization } from "@/shared-hooks/server/own-organization";
import { useOwnOrganization } from "@/shared-hooks/client/useOwnOrganization";
// use invitation

// ui
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function OrgPage() {
  const router = useRouter();

  // check subscription and own organization
  const { orgId: ownOrgId, isLoading: isLoadingOrganization } = useOwnOrganization();

  useEffect(() => {
    if (ownOrgId) {
      router.replace(`/orgs/${ownOrgId}/dashboard`);
    }
    // if has invitation, render the window
  }, [ownOrgId, router]);

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

  if (isLoadingOrganization) {
    return <LoadingSpinner />;
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
    </>
  );
}
