import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { Customers } from "@/types/database/customers";
import { getCustomers } from "./customers";

// type
import { QueryResult } from "@/types/customData";

export const useCustomers = <T = Customers>(
  organizationId: string,
  select?: string
): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["customers", organizationId, select || "*"],
    queryFn: async () => getCustomers(organizationId, select),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });
  return {
    data: result.data as T[],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};
