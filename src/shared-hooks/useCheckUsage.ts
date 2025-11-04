import { useQuery } from "@tanstack/react-query";
import { checkUsage, Usage } from "@/shared-utils/server/check-usage";
import { NetworkError } from "@/types/errors";

type CheckUsageResult = {
  data: Usage | null | undefined;
  isLoading: boolean;
  error: NetworkError | null;
  refetch: () => void;
};

export function useCheckUsage(orgId?: string, enabled: boolean = true): CheckUsageResult {
  const { data, isLoading, error, refetch } = useQuery<Usage | null, NetworkError>({
    queryKey: ["usage", orgId],
    queryFn: () => checkUsage(orgId!),
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
