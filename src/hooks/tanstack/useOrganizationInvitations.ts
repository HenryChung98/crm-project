import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";

type OrgMember = Database["public"]["Tables"]["organization_invitations"]["Row"]; // 1

export type QueryResult<T> = {
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

// all users can invite people using email
export const useOrganizationInvitationsByEmail = <T = OrgMember>(
  select?: string
): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: ["organizationInvitations", "user", user?.email || "", select || "*"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_invitations")
        .select(select || "*")
        .eq("email", user!.email)
        .eq("accepted", false);

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

// 멤버 추가
export const useAddOrganizationInvitation = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMember: Omit<OrgMember, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("organization_invitations")
        .insert(newMember)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organizationInvitations", "user", variables.email],
      });
    },
  });
};

// 멤버 업데이트
export const useUpdateOrganizationInvitation = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OrgMember> }) => {
      const { data, error } = await supabase
        .from("organization_invitations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationInvitations"] });
    },
  });
};

// 멤버 삭제
export const useRemoveOrganizationInvitation = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("organization_invitations")
        .delete()
        .lt("expires_at", "now()");

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationInvitations"] });
    },
  });
};

// 프리페칭
export const usePrefetchOrganizationInvitations = () => {
  const { user, supabase } = useAuth();
  const queryClient = useQueryClient();

  const prefetchMembers = async () => {
    if (user) {
      await queryClient.prefetchQuery({
        queryKey: ["organizationInvitations", "user", user.email],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("organization_invitations")
            .select("*")
            .eq("email", user.email);

          if (error) throw error;
          return data || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return { prefetchMembers };
};
