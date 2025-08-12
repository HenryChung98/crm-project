import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, DashboardStats } from "../hook-actions/dashboard-stats";

export const useDashboardStats = (organizationId: string) => {
  return useQuery({
    queryKey: ["dashboardStats", organizationId],
    queryFn: () => getDashboardStats(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};