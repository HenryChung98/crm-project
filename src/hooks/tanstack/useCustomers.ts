import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";
import { Database } from "@/types/database";

type OrgMember = Database["public"]["Tables"]["customers"]["Row"];

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

export const useCustomers = <T = OrgMember>(
  organizationId: string,
  select?: string
): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: ["customers", organizationId, select || "*"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!organizationId) return [];

      // check user is a part of the organization
      const { data: memberCheck, error: memberError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .single();

      if (memberError) throw new Error("Organization access denied");
      if (!memberCheck) throw new Error("You are not a member of this organization");

      const { data, error } = await supabase
        .from("customers")
        .select(select || "*")
        .eq("organization_id", organizationId);

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId && !!user?.id,
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
