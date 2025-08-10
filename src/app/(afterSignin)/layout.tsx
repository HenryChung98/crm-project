"use client";
import React, { useState, useEffect } from "react";
import CRMSideBar from "../components/navbars/CRMSideBar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAllOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

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
  const currentOrganizationId = searchParams.get("org") || "";

  const { data: orgMembers = [], isLoading } = useAllOrganizationMembers<OrgMember>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name)
    `);

  // get org query from URL

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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("org");
    params.set("org", orgId);

    // update URL
    router.push(`/dashboard?${params.toString()}`);
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
