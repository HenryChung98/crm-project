"use client";
import React from "react";
import CRMSideBar from "../../../components/navbars/sidebar/CRMSideBar";
import { useOrganization } from "../../../contexts/OrganizationContext";
import { useSidebar } from "../../../contexts/SidebarContext";

// providers
import { SidebarProvider } from "../../../contexts/SidebarContext";
import { OrganizationProvider } from "../../../contexts/OrganizationContext";

// ui
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    currentOrganizationId,
    organizations,
    isLoading,
    error: orgError,
    switchOrganization,
  } = useOrganization();

  const { isCollapsed, toggleSidebar } = useSidebar();

  if (orgError) {
    console.error("Organization members error:", orgError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Organizations</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <OrganizationProvider>
        <SidebarProvider>
          <CRMSideBar
            organizations={organizations}
            currentOrg={currentOrganizationId}
            onOrgChange={switchOrganization}
            onToggleSidebar={toggleSidebar}
          />
          <div className={isCollapsed ? "" : "pl-64"}>{children}</div>
        </SidebarProvider>
      </OrganizationProvider>
    </>
  );
}
