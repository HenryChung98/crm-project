"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, ReactNode } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useAllOrganizationMembers } from "../hooks/tanstack/useOrganizationMembers";
import { OrganizationMembers } from "../types/database/organizations";
import { EMPTY_ARRAY } from "../types/customData";

interface OrganizationContextType {
  currentOrganizationId: string;
  organizations: OrganizationMembers[];
  validOrganizationIds: Set<string>;
  defaultOrganizationId: string;
  isLoading: boolean;
  error: Error | null;
  switchOrganization: (orgId: string) => void;
  refetchOrganizations: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const currentOrganizationId = (params.orgId as string) || "";

  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading,
    error,
    refetch,
  } = useAllOrganizationMembers<OrganizationMembers>(`
    id, organization_id, role, created_at,
    organizations:organization_id(name)
  `);

  const validOrganizationIds = useMemo(
    () => new Set(orgMembers?.map((member) => member.organization_id) || []),
    [orgMembers]
  );

  const defaultOrganizationId = useMemo(() => orgMembers?.[0]?.organization_id || "", [orgMembers]);

  const switchOrganization = useCallback(
    (orgId: string) => {
      if (!orgId) return;
      const newPath = pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${orgId}`);
      router.push(newPath);
    },
    [pathname, router]
  );

  const refetchOrganizations = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isLoading || !orgMembers?.length) return;

    const needsRedirect =
      (currentOrganizationId && !validOrganizationIds.has(currentOrganizationId)) ||
      (!currentOrganizationId && defaultOrganizationId);

    if (needsRedirect && defaultOrganizationId) {
      const newPath = pathname.includes("/orgs/")
        ? pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${defaultOrganizationId}`)
        : `/orgs/${defaultOrganizationId}`;
      router.replace(newPath);
    }
  }, [
    isLoading,
    orgMembers,
    currentOrganizationId,
    defaultOrganizationId,
    pathname,
    router,
    validOrganizationIds,
  ]);

  const value = useMemo(
    () => ({
      currentOrganizationId,
      organizations: orgMembers,
      validOrganizationIds,
      defaultOrganizationId,
      isLoading,
      error,
      switchOrganization,
      refetchOrganizations,
    }),
    [
      currentOrganizationId,
      orgMembers,
      validOrganizationIds,
      defaultOrganizationId,
      isLoading,
      error,
      switchOrganization,
      refetchOrganizations,
    ]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
