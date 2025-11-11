"use client";
import React from "react";
import { PrivateProviders } from "@/contexts/PrivateProviders";
import CRMSidebar from "@/components/navbars/sidebar/CRMSideBar";

import { useOrganization } from "@/contexts/OrganizationContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateProviders>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </PrivateProviders>
  );
}

// ✅ Provider 안에서 사용
function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentOrganizationId, allOrganizations, orgMemberLoading, switchOrganization } =
    useOrganization();
  const { planData, planLoading } = useSubscription();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (orgMemberLoading || planLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      <CRMSidebar
        organizations={allOrganizations}
        currentOrg={currentOrganizationId}
        currentOrgPlan={planData?.plan.name}
        onOrgChange={switchOrganization}
        onToggleSidebar={toggleSidebar}
      />
      <div className={isCollapsed ? "" : "pl-64"}>
        <div className="min-h-screen px-20 py-8">
          <div className="max-w-8xl mx-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
