import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database";

import { getOrganizationInvitationsByEmail } from "../hook-actions/organization-invitations";
import { NetworkError } from "@/types/errors";

type OrgMember = Database["public"]["Tables"]["organization_invitations"]["Row"]; // 1

export type QueryResult<T> = {
  data: T[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  // isRefetching: boolean;
  // isSuccess: boolean;
  // isError: boolean;
  // isStale: boolean;
  // status: "idle" | "loading" | "error" | "success";
  refetch: () => void;
};

// all users can invite people using email
export const useOrganizationInvitationsByEmail = <T = OrgMember>(): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["organizationInvitations", "user", "id, organization_id, email, organizations(name)"],
    queryFn: async () => getOrganizationInvitationsByEmail(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: result.data as T[],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};

// 프리페칭
export const usePrefetchOrganizationInvitations = () => {
  const queryClient = useQueryClient();

  const prefetchMembers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ["organizationInvitations", "user"],
      queryFn: () => getOrganizationInvitationsByEmail(),
      
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchMembers };
};
