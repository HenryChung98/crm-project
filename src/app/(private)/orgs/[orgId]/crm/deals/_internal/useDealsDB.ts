import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";
import { getDealsDB } from "./server/deals-db";
import { DealType } from "@/types/database/deals";

export const useDealsDB = (orgId: string): QueryResult<DealType[]> => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<
  DealType[] | null,
    NetworkError
  >({
    queryKey: ["deals", orgId],
    queryFn: () => getDealsDB(orgId),
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
