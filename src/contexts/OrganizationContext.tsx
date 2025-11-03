"use client";

import { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useUserOrganizations } from "@/shared-hooks/client/useOrganizationMembers";
import { OrganizationMembers } from "../types/database/organizations";
import { EMPTY_ARRAY } from "../types/customData";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface OrganizationContextType {
  currentOrganizationId: string;
  organizations: OrganizationMembers[];
  isLoading: boolean;
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
    isLoading,
    error,
  } = useUserOrganizations<OrganizationMembers>(
    `id, organization_id, role, organizations:organization_id(name)`
  );

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
    if (isLoading || !firstOrganizationId) return false;
    return (firstOrganizationId && pathname === "/orgs") || !currentOrganizationId;
  }, [isLoading, firstOrganizationId, pathname, currentOrganizationId]);

  useEffect(() => {
    if (isLoading || !firstOrganizationId) return;

    // if user is in orgs and has an organization
    if (firstOrganizationId && pathname === "/orgs") {
      router.replace(`/orgs/${firstOrganizationId}/dashboard`);
    } else if (!currentOrganizationId) {
      router.replace(`/orgs`);
    }
  }, [isLoading, currentOrganizationId, firstOrganizationId, router]);

  const value = useMemo(
    () => ({
      currentOrganizationId: currentOrganizationId || firstOrganizationId,
      organizations: orgMembers,
      isLoading,
      switchOrganization,
    }),
    [currentOrganizationId, firstOrganizationId, orgMembers, isLoading, switchOrganization]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Failed to load organizations - Context Error
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
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
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
