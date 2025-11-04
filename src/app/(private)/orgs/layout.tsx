"use client";
import React from "react";
import { PrivateProviders } from "@/contexts/PrivateProviders";
import CRMSidebar from "@/components/navbars/sidebar/CRMSideBar";

import { useOrganization } from "@/contexts/OrganizationContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  const { currentOrganizationId, organizations, isLoading, switchOrganization } = useOrganization();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CRMSidebar
        organizations={organizations}
        currentOrg={currentOrganizationId}
        onOrgChange={switchOrganization}
        onToggleSidebar={toggleSidebar}
      />
      <div className={isCollapsed ? "" : "pl-64"}>{children}</div>
    </>
  );
}
