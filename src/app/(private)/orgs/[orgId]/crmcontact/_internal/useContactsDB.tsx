import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@/types/customData";
import { NetworkError } from "@/types/errors";
import { getContactsDB } from "./contacts-db";
import { ContactType } from "@/types/database/customers";

export const useContactsDB = (orgId: string): QueryResult<ContactType[]> => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<
    ContactType[] | null,
    NetworkError
  >({
    queryKey: ["contacts", orgId],
    queryFn: () => getContactsDB(orgId),
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
