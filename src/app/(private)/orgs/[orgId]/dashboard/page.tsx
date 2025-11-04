"use client";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

// ========================================================================
import { BookingLinkModal } from "@/components/navbars/sidebar/BookingLinkModal";
import { useState } from "react";
// ========================================================================
export default function DashboardPage() {
  const { currentOrganizationId, organizations } = useOrganization();

  const currentOrg = organizations.find(
    (member) => member.organization_id === currentOrganizationId
  );
  // ========================================================================
  const [showCopyModal, setShowCopyModal] = useState(false);

  // ========================================================================

  return (
    <>
      {/* =============================================================== */}
      <BookingLinkModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        currentOrgId={currentOrganizationId}
      />

      <button
        className="border border-border rounded p-2 w-full"
        onClick={() => setShowCopyModal(true)}
      >
        Get Links
      </button>

      {/* =============================================================== */}
      <Link href={`dashboard/invite-member`}>invite</Link>
      <SignOutButton />
      <div>{currentOrganizationId} dashboard page</div>
      <div>{currentOrg?.organizations?.name} dashboard page</div>
      <div>{currentOrg?.role} dashboard page</div>

      <h2>All Organizations:</h2>
      <ul>
        {organizations.map((member) => (
          <li key={member.id}>
            {member.organizations?.name} - {member.role}
          </li>
        ))}
      </ul>
    </>
  );
}
