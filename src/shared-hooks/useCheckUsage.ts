import { useQuery } from "@tanstack/react-query";
import { checkMemberUsage, checkCustomersUsage } from "@/shared-actions/check-usage";
import { NetworkError } from "@/types/errors";

type CheckUsageResult = {
  data: number | null | undefined;
  isLoading: boolean;
  error: NetworkError | null;
  refetch: () => void;
};

export function useCheckMemberUsage(orgId?: string, enabled: boolean = true): CheckUsageResult {
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
    data,
    isLoading,
    error,
    refetch,
  };
}
