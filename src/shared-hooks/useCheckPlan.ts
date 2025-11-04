import { useQuery } from "@tanstack/react-query";
import { SubscribedPlan } from "@/types/database/plan";
import { checkPlan } from "@/shared-utils/server/check-plan";
import { NetworkError } from "@/types/errors";

type CheckPlanResult = {
  data: SubscribedPlan | null | undefined;
  isLoading: boolean;
  error: NetworkError | null;
  refetch: () => void;
};

export function useCheckPlan(orgId?: string): CheckPlanResult {
  const { data, isLoading, error, refetch } = useQuery<SubscribedPlan | null, NetworkError>({
    queryKey: ["plan", orgId],
    queryFn: () => checkPlan(orgId),
    enabled: !!orgId,
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
