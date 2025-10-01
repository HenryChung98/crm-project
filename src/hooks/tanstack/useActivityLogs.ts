import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { ActivityLogs } from "@/types/database/activityLogs";
import { getActivityLogs } from "../hook-actions/activity-logs";
import { QueryResult } from "@/types/customData";

export const useActivityLogs = (orgId: string): QueryResult<ActivityLogs> => {
  const result = useQuery({
    queryKey: ["activity_logs", orgId],
    queryFn: () => getActivityLogs(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: result.data || [],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};
