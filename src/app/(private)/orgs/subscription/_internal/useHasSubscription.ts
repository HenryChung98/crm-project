import { useQuery } from "@tanstack/react-query";
import { hasSubscription } from "@/shared-actions/has-subscription";

type HasResult = {
  subscriptionId: string | null | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useHasSubscription = (): HasResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", "check"],
    queryFn: async () => {
      return await hasSubscription();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    subscriptionId: data,
    isLoading,
    error,
    refetch,
  };
};
