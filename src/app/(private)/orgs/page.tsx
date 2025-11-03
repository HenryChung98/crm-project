"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SignOutButton } from "@/app/auth/SignOutButton";

import { useOrganization } from "@/contexts/OrganizationContext";
import { hasSubscription } from "@/shared-hooks/server/has-subscription";
import { ownOrganization } from "@/shared-hooks/server/own-organization";

// use invitation

// ui
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function OrgPage() {
  const router = useRouter();
  const { isLoading } = useOrganization();

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
  } else {
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
}
