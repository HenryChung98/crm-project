import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { Database } from "@/types/database";
import { getCustomers } from "../hook-actions/customers";

type Customers = Database["public"]["Tables"]["customers"]["Row"];

type QueryResult<T> = {
  data: T[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  // isRefetching: boolean;
  // isSuccess: boolean;
  // isError: boolean;
  // isStale: boolean;
  // status: "idle" | "loading" | "error" | "success";
  refetch: () => void;
};

export const useCustomers = <T = Customers>(
  organizationId: string,
  select?: string
): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["customers", organizationId, select || "*"],
    queryFn: async () => getCustomers(organizationId, select),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
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
