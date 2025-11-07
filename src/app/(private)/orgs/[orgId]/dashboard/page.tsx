"use client";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect } from "react";

export default function DashboardPage() {
  const { currentOrganizationId, member, ownOrganization } = useOrganization();
  const { planData, planLoading } = useSubscription();

  if (planLoading) {
    return <>loading..</>;
  }
  return (
    <>
      <Link href={`dashboard/invite-member`}>invite</Link>
      <SignOutButton />

      <div>{currentOrganizationId} dashboard page</div>
      <div>{member?.organizations?.name} dashboard page</div>
      <div>{member?.role} dashboard page</div>
      <div>{member?.organizations?.subscription?.plan.name} dashboard page</div>
      <div>{planData?.payment_status} dashboard page</div>
      <div>{ownOrganization} dashboard page</div>

      {/* <ul>
        {organizations.map((member) => (
          <li key={member.id}>
            {member.organizations?.name} - {member.role}
          </li>
        ))}
      </ul> */}
    </>
  );
}
