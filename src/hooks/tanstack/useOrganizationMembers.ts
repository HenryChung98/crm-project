import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";

type OrgMember = Database["public"]["Tables"]["organization_members"]["Row"];

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

// all users can accept organization members database (for organization list in navbar)
export const useAllOrganizationMembers = <T = OrgMember>(select?: string): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: ["organizationMembers", "user", user?.id || "", select || "*"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("organization_members")
        .select(select || "*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
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

// only owner or admin can use this hook (for )
export const useAdminOrganizationMembers = <T = OrgMember>(
  orgId: string,
  requiredRoles: ("owner" | "admin")[],
  select = "*",
  options: { enabled?: boolean } = {}
): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: [
      "organizationMembers",
      "org",
      orgId,
      select,
      "members-by-role",
      requiredRoles.sort(),
    ],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: adminCheck, error: adminError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("role", requiredRoles)
        .maybeSingle();

      if (adminError) throw adminError;
      if (!adminCheck) throw new Error(`${requiredRoles.join(" or ")} permission required`);

      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select(select)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;
      return members || [];
    },
    enabled: !!orgId && !!user?.id && requiredRoles.length > 0 && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: Error) => {
      if (error.message?.includes("Admin permission required")) return false;
      return failureCount < 2;
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

// pre-fetch
export const usePrefetchOrganizationMembers = () => {
  const { user, supabase } = useAuth();
  const queryClient = useQueryClient();

  const prefetchMembers = async (orgId?: string) => {
    if (orgId) {
      await queryClient.prefetchQuery({
        queryKey: ["organizationMembers", "org", orgId],
        queryFn: async () => {
          if (!user?.id) throw new Error("User not authenticated");
          const { data, error } = await supabase
            .from("organization_members")
            .select("*")
            .eq("organization_id", orgId);

          if (error) throw error;
          return data || [];
        },
        staleTime: 2 * 60 * 1000,
      });
    } else if (user) {
      await queryClient.prefetchQuery({
        queryKey: ["organizationMembers", "user", user.id],
        queryFn: async () => {
          if (!user?.id) throw new Error("User not authenticated");
          const { data, error } = await supabase
            .from("organization_members")
            .select("*")
            .eq("user_id", user.id);

          if (error) throw error;
          return data || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return { prefetchMembers };
};
