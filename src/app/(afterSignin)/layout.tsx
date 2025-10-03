"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CRMSideBar from "../../components/navbars/CRMSideBar";
import { useAuth } from "@/contexts/AuthContext";
// hook
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationMembers } from "@/types/database/organizations";

// ui
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // ===============================================
  const { user } = useAuth();
  if (user) {
    console.log(user);
  } else {
    console.log("not logged in");
  }
  // ===============================================

  // get organization id from current param
  const currentOrganizationId = searchParams.get("org") || "";

  // get organization member data
  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: isLoadingOrgMembers,
    error: orgMembersError,
  } = useAllOrganizationMembers<OrganizationMembers>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name)
  `);

  const { validOrganizationIds, defaultOrganizationId } = useMemo(() => {
    const orgIds = orgMembers?.map((member) => member.organization_id) || [];
    return {
      validOrganizationIds: new Set(orgIds),
      defaultOrganizationId: orgIds[0] || "",
    };
  }, [orgMembers]);

  // change organization handler
  const handleOrganizationSwitch = useCallback(
    (orgId: string) => {
      if (!orgId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("org", orgId);
      router.push(`/dashboard?${params.toString()}`);
    },
    [searchParams, router]
  );

  // 조직 유효성 검사 및 리다이렉트
  useEffect(() => {
    if (isLoadingOrgMembers || !orgMembers?.length) return;

    const needsRedirect =
      (currentOrganizationId && !validOrganizationIds.has(currentOrganizationId)) ||
      (!currentOrganizationId && defaultOrganizationId);

    if (needsRedirect && defaultOrganizationId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("org", defaultOrganizationId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    isLoadingOrgMembers,
    orgMembers?.length,
    currentOrganizationId,
    validOrganizationIds,
    defaultOrganizationId,
    searchParams,
    pathname,
    router,
  ]);

  if (orgMembersError) {
    console.error("Organization members error:", orgMembersError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Organizations</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoadingOrgMembers) {
    return <LoadingSpinner />;
  }

  // if (!currentOrganizationId || !validOrganizationIds.has(currentOrganizationId)) {
  //   if (defaultOrganizationId) {
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set("org", defaultOrganizationId);
  //     router.replace(`${pathname}?${params.toString()}`);
  //   }
  //   return <LoadingSpinner />; // 리다이렉트 중에도 로딩 표시
  // }

  return (
    <>
      <CRMSideBar
        organizations={orgMembers}
        currentOrg={currentOrganizationId}
        onOrgChange={handleOrganizationSwitch}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className={isSidebarCollapsed ? "" : "pl-64"}>{children}</div>
    </>
  );
}
