import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";
import { getProductsDB } from "./server/products-db";
import { ProductType } from "@/types/database/products";

export const useProductsDB = (orgId: string): QueryResult<ProductType[]> => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<
    ProductType[] | null,
    NetworkError
  >({
    queryKey: ["products", orgId],
    queryFn: () => getProductsDB(orgId),
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
