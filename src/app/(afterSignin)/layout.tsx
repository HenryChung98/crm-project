"use client";
import React, { useState, useEffect } from "react";
import CRMSideBar from "../components/navbars/CRMSideBar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

type OrgMember = {
  id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organizations: {
    name: string;
  } | null;
};

export default function AfterSigninLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { data: orgMembers = [], isLoading } = useOrganizationMembers<OrgMember>(`
    id, organization_id, role, created_at, role,
    organizations:organization_id(name)
    `);

  // =================== using session ===================
  // const [currentOrganizationId, setCurrentOrganizationId] = useState<string>("");

  // const STORAGE_KEY = "current_organization_id";
  // useEffect(() => {
  //   if (!orgMembers || orgMembers.length === 0) return;

  //   const savedOrgId = sessionStorage.getItem(STORAGE_KEY);

  //   const isValidOrgId =
  //     savedOrgId && orgMembers.some((member) => member.organization_id === savedOrgId);

  //   const targetOrgId = isValidOrgId ? savedOrgId : orgMembers[0].organization_id;

  //   setCurrentOrganizationId(targetOrgId);

  //   // 세션에 저장
  //   sessionStorage.setItem(STORAGE_KEY, targetOrgId);
  // }, [orgMembers]);

  // const handleOrganizationSwitch = (orgId: string) => {
  //   console.log("Changed :", orgId);
  //   setCurrentOrganizationId(orgId);
  //   sessionStorage.setItem(STORAGE_KEY, orgId);
  // };

  // =================== using session ===================

  // =================== using URL parameters ===================
  // get org query from URL
  const currentOrganizationId = searchParams.get("org") || "";

  useEffect(() => {
    if (!orgMembers || orgMembers.length === 0) return;

    // if org query is undefined or invalid
    const isValidOrgId =
      currentOrganizationId &&
      orgMembers.some((member) => member.organization_id === currentOrganizationId);

    if (!isValidOrgId) {
      // redirect to first index organization
      const defaultOrgId = orgMembers[0].organization_id;
      const params = new URLSearchParams(searchParams.toString());
      params.set("org", defaultOrgId);

      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [orgMembers, currentOrganizationId, router, pathname, searchParams]);

  // switch handler
  const handleOrganizationSwitch = (orgId: string) => {
    console.log("Changed :", orgId);

    const params = new URLSearchParams(searchParams.toString());
    params.set("org", orgId);

    // update URL
    router.push(`${pathname}?${params.toString()}`);
  };

  // =================== using URL parameters ===================

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
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
