"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CRMSideBar from "../../components/navbars/CRMSideBar";
import { useAuth } from "@/contexts/AuthContext";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationMembers } from "@/types/database/organizations";

// ui
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AfterSigninLayoutProps {
  children: React.ReactNode;
}

export default function AfterSigninLayout({ children }: AfterSigninLayoutProps) {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL에서 현재 조직 ID 가져오기
  const currentOrganizationId = useMemo(() => searchParams.get("org") || "", [searchParams]);

  // 조직 멤버 데이터 가져오기
  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: isLoadingOrgMembers,
    error: orgMembersError,
  } = useAllOrganizationMembers<OrganizationMembers>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name)
  `);

  // 유효한 조직 ID인지 확인하는 함수
  const isValidOrganizationId = useCallback(
    (orgId: string): boolean => {
      if (!orgId || !orgMembers?.length) return false;
      return orgMembers.some((member) => member.organization_id === orgId);
    },
    [orgMembers]
  );

  // 기본 조직으로 리다이렉트하는 함수
  const redirectToDefaultOrganization = useCallback(
    (defaultOrgId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("org", defaultOrgId);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // 조직 변경 핸들러
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
    if (isLoadingOrgMembers || !orgMembers?.length) {
      return;
    }

    // 현재 조직 ID가 유효하지 않은 경우 기본 조직으로 리다이렉트
    if (!isValidOrganizationId(currentOrganizationId)) {
      const defaultOrgId = orgMembers[0]?.organization_id;
      if (defaultOrgId) {
        redirectToDefaultOrganization(defaultOrgId);
      }
    }
  }, [
    orgMembers,
    currentOrganizationId,
    isLoadingOrgMembers,
    isValidOrganizationId,
    redirectToDefaultOrganization,
  ]);

  // 에러 처리
  if (orgMembersError) {
    console.error("Organization members error:", orgMembersError);
    return (
      <div className="flex items-center justify-center min-h-screen">
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
