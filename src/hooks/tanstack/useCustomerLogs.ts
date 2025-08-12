import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";
import { Database } from "@/types/database";

type CustomerLogs = Database["public"]["Tables"]["customer_logs"]["Row"];

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

export const useCustomerLogs = <T = CustomerLogs>(orgId: string): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: ["customer_logs", orgId],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!orgId) return [];

      // check user is valid to access
      const { data: memberCheck, error: memberError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .single();

      if (memberError || !memberCheck) {
        throw new Error("Access denied: Not a member of the organization");
      }

      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id")
        .eq("organization_id", orgId);

      if (customersError) {
        throw new Error("Failed to fetch customers");
      }

      if (!customers || customers.length === 0) {
        return [];
      }

      const customerIds = customers.map((customer) => customer.id);

      const { data, error } = await supabase
        .from("customer_logs")
        .select("*")
        .in("customer_id", customerIds)
        .order("performed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!orgId && !!user?.id,
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
