"use client";
import { AccessDenied } from "@/components/AccessDenied";
import { useOrganization } from "@/contexts/OrganizationContext";
export default function MemberPage() {
  const { member } = useOrganization();

  if (member?.role !== "owner") {
    return <AccessDenied title="Access Denied" message="Owner role required" />;
  }
  return (
    <>
      <div>{member?.role}</div>
    </>
  );
}
