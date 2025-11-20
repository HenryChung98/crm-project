import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, DashboardStatsResponse } from "./dashboard-stats";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";

export const useDashboardStats = (orgId: string): QueryResult<DashboardStatsResponse> => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardStatsResponse | null, NetworkError>({
    queryKey: ["dashboardStats", orgId],
    queryFn: () => getDashboardStats(orgId),
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