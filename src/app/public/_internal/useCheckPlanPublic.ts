import { useQuery } from "@tanstack/react-query";
import { checkPlanPublic, CheckPlanPublicType } from "./check-plan-public";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";

export const useCheckPlanPublic = (orgId: string): QueryResult<CheckPlanPublicType> => {
    const { data, isLoading, error, refetch } = useQuery<CheckPlanPublicType | null, NetworkError>({
      queryKey: ["plan", orgId],
      queryFn: () => checkPlanPublic(orgId),
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