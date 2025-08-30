import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { CustomerLogs } from "@/types/database/customers";
import { getCustomerLogs } from "../hook-actions/customer-logs";

// type
import { QueryResult } from "@/types/customData";

export const useCustomerLogs = <T = CustomerLogs>(
  orgId: string,
  select?: string
): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["customer_logs", orgId, select || "*"],
    queryFn: () => getCustomerLogs(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });
  return {
    data: (result.data as T[]) || [],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};
