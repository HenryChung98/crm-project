"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CRMSideBar from "../../components/navbars/CRMSideBar";
import { useAuth } from "@/contexts/AuthContext";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

// type
import { EMPTY_ARRAY } from "@/types/customData";

// ui
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type OrgMember = {
  id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organizations: {
    name: string;
    plan_id?: string;
  } | null;
};

interface AfterSigninLayoutProps {
  children: React.ReactNode;
}

export default function AfterSigninLayout({ children }: AfterSigninLayoutProps) {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [profileChecked, setProfileChecked] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // URL에서 현재 조직 ID 가져오기
  const currentOrganizationId = useMemo(() => searchParams.get("org") || "", [searchParams]);

  // 조직 멤버 데이터 가져오기
  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: isLoadingOrgMembers,
    error: orgMembersError,
  } = useAllOrganizationMembers<OrgMember>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name, plan_id)
  `);

  // 유효한 조직 ID인지 확인하는 함수
  const isValidOrganizationId = useCallback(
    (orgId: string): boolean => {
      if (!orgId || !orgMembers?.length) return false;
      return orgMembers.some((member) => member.organization_id === orgId);
    },
    [orgMembers]
  );

  // 프로필 확인 함수
  const checkUserProfile = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !supabase) return false;

    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // 프로필이 존재하지 않는 경우
      if (error?.code === "PGRST116" || !profile) {
        router.replace("/pricing");
        return false;
      }

      // 기타 에러 처리 (로그만 남기고 계속 진행)
      if (error) {
        console.error("Profile check error:", error);
      }

      return true;
    } catch (error) {
      console.error("Unexpected error during profile check:", error);
      return true; // 예외 상황에서는 계속 진행
    }
  }, [user?.id, supabase, router]);

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

  // 인증 및 프로필 확인
  useEffect(() => {
    const initializeAuth = async () => {
      const profileExists = await checkUserProfile();
      if (profileExists) {
        setProfileChecked(true);
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [user, checkUserProfile, router]);

  // 조직 유효성 검사 및 리다이렉트
  useEffect(() => {
    if (!profileChecked || isLoadingOrgMembers || !orgMembers?.length) {
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
    profileChecked,
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

  if (isInitializing || isLoadingOrgMembers || !profileChecked) {
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
