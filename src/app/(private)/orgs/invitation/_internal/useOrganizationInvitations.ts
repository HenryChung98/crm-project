import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationInvitations } from "../../../../../types/database/organizations";
import { checkInvitation } from "./organization-invitations";

// types
import { NetworkError } from "@/types/errors";
import { QueryResultArray } from "@/types/customData";

// all users can invite people using email
export const useInvitationCheck = (): QueryResultArray<OrganizationInvitations> => {
  const { data, error, isLoading, isFetching, refetch } = useQuery<
    OrganizationInvitations[],
    NetworkError
  >({
    queryKey: [
      "organizationInvitations",
      "user",
      "id, organization_id, email, organizations(name)",
    ],
    queryFn: async () => checkInvitation(),
    retry: (failureCount: number, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: data ?? [],
    error,
    isLoading,
    isFetching,
    refetch,
  };
};
