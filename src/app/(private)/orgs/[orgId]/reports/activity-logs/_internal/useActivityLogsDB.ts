import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";
import { getActivityLogsDB } from "./server/activity-log-db";
import { ActivityLogType } from "@/types/database/activityLogs";

export const useActivityLogsDB = (orgId: string): QueryResult<ActivityLogType[]> => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<
    ActivityLogType[] | null,
    NetworkError
  >({
    queryKey: ["logs", orgId],
    queryFn: () => getActivityLogsDB(orgId),
    enabled: !!orgId && orgId.trim().length > 0,
    retry: (failureCount, error) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    refetch,
    isFetching,
  };
};
