"use client";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default function DashboardPage() {
  const { currentOrganizationId, member } = useOrganization();

  return (
    <>
      <Link href={`dashboard/invite-member`}>invite</Link>
      <SignOutButton />

      <div>{currentOrganizationId} dashboard page</div>
      <div>{member?.organizations?.name} dashboard page</div>
      <div>{member?.role} dashboard page</div>

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
