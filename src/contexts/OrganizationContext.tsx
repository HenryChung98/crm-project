"use client";

import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// types
import { OrganizationMembers } from "../types/database/organizations";
import { EMPTY_ARRAY } from "../types/customData";

// custom hooks
import { useUserOrganizations } from "@/shared-hooks/useOrganizationMembers";
import { useCheckPlan } from "@/shared-hooks/useCheckPlan";

interface OrganizationContextType {
  currentOrganizationId: string;
  organizations: OrganizationMembers[];
  orgMemberLoading: boolean;
  plan: string | undefined;
  planLoading: boolean;
  switchOrganization: (orgId: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // get current organization id from params
  const currentOrganizationId = (params.orgId as string) ?? "";

  // get data from organization_members
  const {
    data: orgMembers = EMPTY_ARRAY,
    isLoading: orgMemberLoading,
    error: orgMemberError,
  } = useUserOrganizations<OrganizationMembers>(
    `id, organization_id, role, organizations:organization_id(name)`
  );

  // get plan from subscriptions
  const { data: plan, isLoading: planLoading } = useCheckPlan(currentOrganizationId);

  // define first organization for default organization
  const firstOrganizationId = useMemo(() => orgMembers?.[0]?.organization_id || "", [orgMembers]);

  // switch organization function (for sidebar)
  const switchOrganization = useCallback(
    (orgId: string) => {
      if (!orgId) return;
      const newPath = pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${orgId}/dashboard`);
      router.push(newPath);
    },
    [pathname, router]
  );

  // Check if redirect is needed (accessing /orgs root or missing orgId in URL)
  const shouldRedirect = useMemo(() => {
    if (orgMemberLoading || planLoading || !firstOrganizationId) return false;
    if (pathname.startsWith("/orgs/create-organization")) return false;
    return (firstOrganizationId && pathname === "/orgs") || !currentOrganizationId;
  }, [orgMemberLoading, planLoading, firstOrganizationId, pathname, currentOrganizationId]);

  // check user has access to current organization
  const hasAccessToCurrentOrg = useMemo(() => {
    if (!currentOrganizationId) return false;
    return orgMembers.some((member) => member.organization_id === currentOrganizationId);
  }, [currentOrganizationId, orgMembers]);

  // ============================================================================
  useEffect(() => {
    if (orgMemberLoading || planLoading) return;

    // if user has an organization redirect to dashboard page
    if (pathname === "/orgs" && firstOrganizationId) {
      router.replace(`/orgs/${firstOrganizationId}/dashboard`);
      return;
    }

    // if user doesn't have organization, redirect to /orgs
    if (!firstOrganizationId && pathname.startsWith("/orgs/")) {
      router.replace("/orgs");
      return;
    }
  }, [orgMemberLoading, planLoading, pathname, currentOrganizationId, firstOrganizationId, router]);
  // ============================================================================

  const value = useMemo(
    () => ({
      currentOrganizationId,
      organizations: orgMembers,
      orgMemberLoading,
      plan: plan?.plans.name,
      planLoading,
      switchOrganization,
    }),
    [
      currentOrganizationId,
      firstOrganizationId,
      orgMembers,
      orgMemberLoading,
      planLoading,
      switchOrganization,
    ]
  );

  if (orgMemberError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Failed to load organizations - Context Error
          </h2>
          <p className="text-gray-600 mb-4">{orgMemberError.message}</p>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <LoadingSpinner />;
  }

  if (currentOrganizationId && !hasAccessToCurrentOrg && firstOrganizationId) {
    return (
      <>
        <div>404 page</div>
        <div>access denied</div>
        <button onClick={() => router.back()}>go back</button>
      </>
    );
  }
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
