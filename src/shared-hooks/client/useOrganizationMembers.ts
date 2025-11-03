import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOrganizations, getAdminOrganizations } from "../server/organization-members";
import { OrganizationMembers } from "../../types/database/organizations";

// type
import { NetworkError } from "../../types/errors";
import { QueryResult } from "../../types/customData";

// 사용자가 속한 모든 조직 멤버십 조회 (네비바의 조직 목록용)
export const useUserOrganizations = <T = OrganizationMembers>(
  select?: string
): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["organizationMembers", "user", select || "*"],
    queryFn: () => getUserOrganizations(select),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: (result.data as T[]) || [],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};

// 관리자 권한이 필요한 조직 멤버 목록 조회
export const useAdminOrganizations = <T = OrganizationMembers>(
  orgId: string,
  requiredRoles: ("owner" | "admin")[],
  select = "*",
  options: { enabled?: boolean } = {}
): QueryResult<T> => {
  const result = useQuery({
    queryKey: [
      "organizationMembers",
      "org",
      orgId,
      select,
      "members-by-role",
      requiredRoles.sort(),
    ],
    queryFn: () => getAdminOrganizations(orgId, requiredRoles, select),
    enabled: !!orgId && requiredRoles.length > 0 && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: Error) => {
      if (error.message?.includes("permission required")) return false;
      return failureCount < 2;
    },
  });

  return {
    data: (result.data as T[]) || [],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};


// 프리페칭
export const usePrefetchOrganizations = () => {
  const queryClient = useQueryClient();

  const prefetchMembers = async (orgId?: string) => {
    if (orgId) {
      // 특정 조직의 멤버 프리페칭
      await queryClient.prefetchQuery({
        queryKey: ["organizationMembers", "org", orgId],
        queryFn: () => getAdminOrganizations(orgId, ["owner", "admin"]),
        staleTime: 2 * 60 * 1000,
      });
    } else {
      // 사용자의 모든 조직 멤버십 프리페칭
      await queryClient.prefetchQuery({
        queryKey: ["organizationMembers", "user"],
        queryFn: () => getUserOrganizations(),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return { prefetchMembers };
};
