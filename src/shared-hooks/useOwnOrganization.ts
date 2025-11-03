import { useQuery } from "@tanstack/react-query";
import { ownOrganization } from "../shared-utils/server/own-organization";

type HasResult = {
  orgId: string | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useOwnOrganization = (): HasResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["organization", "check"],
    // queryFn: async () => {
    //   const res = await fetch("/api/organization/check", { cache: "no-store" });
    //   if (!res.ok) throw new Error("Organization check failed");
    //   const json = await res.json();
    //   return Boolean(json?.has);
    // },
    queryFn: () => ownOrganization(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });

  return {
    orgId: data,
    isLoading,
    error,
    refetch,
  };
};
