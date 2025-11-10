import { useQuery } from "@tanstack/react-query";
import { checkPlan, CheckPlanType } from "@/shared-actions/check-plan";
import { NetworkError } from "@/types/errors";
import { QueryResult } from "../types/customData";

export const useCheckPlan = (orgId: string): QueryResult<CheckPlanType> => {
  const { data, isLoading, error, refetch } = useQuery<CheckPlanType | null, NetworkError>({
    queryKey: ["plan", orgId],
    queryFn: () => checkPlan(orgId),
    enabled: !!orgId,
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
