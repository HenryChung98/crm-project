"use client";

import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { notFound } from "next/navigation";
// types
import { OrganizationContextQuery } from "../types/database/organizations";
import { EMPTY_ARRAY } from "../types/customData";

// custom hooks
import { useUserOrganizations } from "@/shared-hooks/useUserOrganizations";

interface OrganizationContextType {
  currentOrganizationId: string;
  allOrganizations: OrganizationContextQuery[];
  member: OrganizationContextQuery | null;
  ownOrganization: string | null;
  orgMemberLoading: boolean;
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
  } = useUserOrganizations();

  if (!orgMembers) {
    return;
  }

  // to get organization member of current
  const orgMember = orgMembers.find((member) => member.organization_id === currentOrganizationId);

  // define first organization for default organization
  const firstOrganizationId = useMemo(() => orgMembers?.[0]?.organization_id || "", [orgMembers]);

  // define allowed path without belonging to an organization
  const allowedPaths = ["/orgs/create-organization", "/orgs/invitation", "/orgs/subscription"];

  // switch organization function (for sidebar)
  const switchOrganization = useCallback(
    (orgId: string) => {
      if (!orgId) return;
      const newPath = pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${orgId}`);
      router.push(newPath);
    },
    [pathname, router]
  );

  // Check if redirect is needed (accessing /orgs root or missing orgId in URL)
  const shouldRedirect = useMemo(() => {
    if (orgMemberLoading || !firstOrganizationId) return false;

    // these paths are allowed to access with no organization
    if (allowedPaths.some((path) => pathname.startsWith(path))) return false;

    return (firstOrganizationId && pathname === "/orgs") || !currentOrganizationId;
  }, [orgMemberLoading, firstOrganizationId, pathname, currentOrganizationId]);

  // check user has access to current organization
  const hasAccessToCurrentOrg = useMemo(() => {
    if (!currentOrganizationId) return false;
    return orgMembers.some((member) => member.organization_id === currentOrganizationId);
  }, [currentOrganizationId, orgMembers]);

  // if user has a role at least one "owner", set OwnOrg(true)
  const ownOrg = useMemo(() => {
    return orgMembers.find((member) => member.role === "owner")?.organization_id ?? null;
  }, [orgMembers]);

  // ============================================================================
  useEffect(() => {
    if (orgMemberLoading) return;

    // if user has an organization redirect to dashboard page
    if (pathname === "/orgs" && firstOrganizationId) {
      router.replace(`/orgs/${firstOrganizationId}/dashboard`);
      return;
    }

    // if user doesn't have organization and trying to access [orgId] pages
    if (!firstOrganizationId && pathname.startsWith("/orgs/")) {
      const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

      if (!isAllowedPath) {
        notFound();
      }
    }
  }, [orgMemberLoading, pathname, currentOrganizationId, firstOrganizationId, router]);
  // ============================================================================

  const value = useMemo(
    () => ({
      currentOrganizationId,
      allOrganizations: orgMembers,
      member: orgMember ?? null,
      orgMemberLoading,
      ownOrganization: ownOrg,
      switchOrganization,
    }),
    [
      currentOrganizationId,
      firstOrganizationId,
      orgMembers,
      orgMemberLoading,
      ownOrg,
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

  // if user has an organization, but trying to access another organization
  if (currentOrganizationId && !hasAccessToCurrentOrg && firstOrganizationId) {
    notFound();
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
