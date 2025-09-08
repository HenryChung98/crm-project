"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CRMSideBar from "../../components/navbars/CRMSideBar";

// hook
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
import { usePlanByUser } from "@/hooks/tanstack/usePlan";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationMembers } from "@/types/database/organizations";

// ui
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AfterSigninLayoutProps {
  children: React.ReactNode;
}

export default function AfterSigninLayout({ children }: AfterSigninLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // URL에서 현재 조직 ID 가져오기
  const currentOrganizationId = useMemo(() => searchParams.get("org") || "", [searchParams]);

  const { data: plan, isLoading: planLoading } = usePlanByUser();

  // 조직 멤버 데이터 가져오기
  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: isLoadingOrgMembers,
    error: orgMembersError,
  } = useAllOrganizationMembers<OrganizationMembers>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name)
  `);

  // 유효한 조직 ID들을 미리 계산
  const validOrganizationIds = useMemo(
    () => new Set(orgMembers?.map((member) => member.organization_id) || []),
    [orgMembers]
  );

  // 기본 조직 ID
  const defaultOrganizationId = useMemo(() => orgMembers?.[0]?.organization_id || "", [orgMembers]);

  // 조직 변경 핸들러 (의존성 최소화)
  const handleOrganizationSwitch = useCallback(
    (orgId: string) => {
      if (!orgId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("org", orgId);
      router.push(`/dashboard?${params.toString()}`);
    },
    [searchParams, router]
  );

  // 플랜 검사 (별도 useEffect)
  useEffect(() => {
    if (!planLoading && plan && !plan.subscription && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/subscription");
    }
  }, [planLoading, plan, router, hasRedirected]);

  // 조직 유효성 검사 및 리다이렉트 (별도 useEffect)
  useEffect(() => {
    if (
      isLoadingOrgMembers ||
      !orgMembers?.length ||
      hasRedirected ||
      planLoading // 플랜 로딩 중이면 대기
    ) {
      return;
    }

    // 현재 조직 ID가 유효하지 않은 경우 기본 조직으로 리다이렉트
    if (currentOrganizationId && !validOrganizationIds.has(currentOrganizationId)) {
      if (defaultOrganizationId) {
        setHasRedirected(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("org", defaultOrganizationId);
        router.replace(`${pathname}?${params.toString()}`);
      }
    } else if (!currentOrganizationId && defaultOrganizationId) {
      // org 파라미터가 없는 경우 기본 조직으로 리다이렉트
      setHasRedirected(true);
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
    hasRedirected,
    planLoading,
    searchParams,
    pathname,
    router,
  ]);

  // 에러 처리
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

  if (isLoadingOrgMembers || planLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <CRMSideBar
        organizations={orgMembers}
        currentOrg={currentOrganizationId}
        onOrgChange={handleOrganizationSwitch}
      />
      <div className="pl-64">{children}</div>
    </>
  );
}
