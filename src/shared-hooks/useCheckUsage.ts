import { useQuery } from "@tanstack/react-query";
import { checkMemberUsage, checkContactUsage } from "@/shared-actions/check-usage";
import { NetworkError } from "@/types/errors";
import { QueryResult } from "../types/customData";

export const useCheckMemberUsage = (
  orgId: string,
  enabled: boolean = true
): QueryResult<number> => {
  const { data, isLoading, error, refetch } = useQuery<number | null, NetworkError>({
    queryKey: ["usage", orgId],
    queryFn: () => checkMemberUsage(orgId!),
    enabled: !!orgId && enabled,
    retry: (failureCount: number, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
  };
};
