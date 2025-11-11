"use client";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { currentOrganizationId, member, ownOrganization } = useOrganization();
  const { planData, planLoading } = useSubscription();

  return (
    <>
      <Link href={`dashboard/invite-member`}>invite</Link>
      <Link href={`/orgs/subscription`}>sub</Link>
      <SignOutButton />

      <div>{currentOrganizationId} dashboard page</div>
      <div>{member?.organizations?.name} dashboard page</div>
      <div>{member?.role} dashboard page</div>
      <div>{member?.organizations?.subscription?.plan.name} dashboard page</div>
      <div>{planData?.payment_status} dashboard page</div>
      <div>{ownOrganization} dashboard page</div>
    </>
  );
}
