import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationInvitations } from "../../types/database/organizations";
import { getOrganizationInvitationsByEmail } from "./[orgId]/dashboard/invite-member/organization-invitations";

// type
import { NetworkError } from "../../types/errors";
import { QueryResult } from "../../types/customData";

// all users can invite people using email
export const useOrganizationInvitationsByEmail = <
  T = OrganizationInvitations
>(): QueryResult<T> => {
  const result = useQuery({
    queryKey: [
      "organizationInvitations",
      "user",
      "id, organization_id, email, organizations(name)",
    ],
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
