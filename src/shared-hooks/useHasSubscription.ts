import { useQuery } from "@tanstack/react-query";
import { hasSubscription } from "../shared-utils/server/has-subscription";

type HasResult = {
  hasData: boolean | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useHasSubscription = (): HasResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", "check"],
    // queryFn: async () => {
    //   const res = await fetch("/api/subscription/check", { cache: "no-store" });
    //   if (!res.ok) throw new Error("Subscription check failed");
    //   const json = await res.json();
    //   return Boolean(json?.has);
    // },
    queryFn: async () => {
      const has = await hasSubscription();
      return Boolean(has);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    hasData: data,
    isLoading,
    error,
    refetch,
  };
};
