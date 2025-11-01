import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { Products } from "@/types/database/products";
import { getProducts } from "./products";

// type
import { QueryResult } from "@/types/customData";

export const useDBProducts = <T = Products>(
  organizationId: string,
  select?: string
): QueryResult<T> => {
  const result = useQuery({
    queryKey: ["products", organizationId, select || "*"],
    queryFn: async () => getProducts(organizationId, select),
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
