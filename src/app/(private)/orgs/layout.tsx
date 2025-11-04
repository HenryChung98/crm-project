"use client";
import React from "react";
import { PrivateProviders } from "@/contexts/PrivateProviders";
import CRMSidebar from "@/components/navbars/sidebar/CRMSideBar";

import { useOrganization } from "@/contexts/OrganizationContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateProviders>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </PrivateProviders>
  );
}

// ✅ Provider 안에서 사용
function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    currentOrganizationId,
    organizations,
    orgMemberLoading,
    switchOrganization,
  } = useOrganization();
  const { plan, planLoading } = useSubscription();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (orgMemberLoading || planLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CRMSidebar
        organizations={organizations}
        currentOrg={currentOrganizationId}
        currentOrgPlan={plan}
        onOrgChange={switchOrganization}
        onToggleSidebar={toggleSidebar}
      />
      <div className={isCollapsed ? "" : "pl-64"}>{children}</div>
    </>
  );
}
