"use client";
import Link from "next/link";
import { AccessDenied } from "@/components/pages/AccessDenied";
import { useOrganization } from "@/contexts/OrganizationContext";
export default function MemberPage() {
  const { member, currentOrganizationId } = useOrganization();

  if (member?.role !== "owner") {
    return <AccessDenied title="Access Denied" message="Owner role required" />;
  }
  return (
    <>
      <div>{member?.role}</div>
      <Link href={`/orgs/${currentOrganizationId}/dashboard/invite-member`}>invite</Link>
    </>
  );
}
