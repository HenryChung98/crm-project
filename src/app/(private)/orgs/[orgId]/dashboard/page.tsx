"use client";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default function DashboardPage() {
  const { currentOrganizationId, organizations } = useOrganization();

  const currentOrg = organizations.find(
    (member) => member.organization_id === currentOrganizationId
  );

  return (
    <>
      <Link href={`dashboard/invite-member`}>invite</Link>
      <SignOutButton />

      <div>{currentOrganizationId} dashboard page</div>
      <div>{currentOrg?.organizations?.name} dashboard page</div>
      <div>{currentOrg?.role} dashboard page</div>

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
