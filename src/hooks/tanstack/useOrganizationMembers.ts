import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";

type OrgMember = Database["public"]["Tables"]["organization_members"]["Row"];

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

export const orgKeys = {
  all: ["organizationMembers"] as const,
  byUser: (userId: string) => [...orgKeys.all, "user", userId] as const,
  byOrg: (orgId: string) => [...orgKeys.all, "org", orgId] as const,
  byAdmin: (orgId: string) => [...orgKeys.byOrg(orgId), "role", "admin"] as const,
};

export const useAllOrganizationMembers = <T = OrgMember>(select?: string): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: [...orgKeys.byUser(user?.id || ""), select || "*"],
    queryFn: async () => {
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

export const useAdminOrganizationMembers = <T = OrgMember>(
  orgId: string,
  select = "*",
  options: { enabled?: boolean } = {}
): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: [...orgKeys.byOrg(orgId), select, "admin-members"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: adminCheck, error: adminError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) throw adminError;
      if (!adminCheck) throw new Error("Admin permission required");

      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select(select)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;
      return members || [];
    },
    enabled: !!orgId && !!user?.id && options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: Error) => {
      // 권한 에러는 재시도 안 함
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

// 멤버 추가
export const useAddOrganizationMember = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMember: Omit<OrgMember, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("organization_members")
        .insert(newMember)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.byUser(variables.user_id) });
      queryClient.invalidateQueries({ queryKey: orgKeys.byOrg(variables.organization_id) });
    },
  });
};

export const useAdminUpdateOrganizationMember = () => {
  const { user, supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updateId,
      updates,
      organizationId,
    }: {
      updateId: string;
      updates: Partial<OrgMember>;
      organizationId: string;
    }) => {
      const { data: currentMember } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user?.id)
        .eq("organization_id", organizationId)
        .single();

      if (currentMember?.role !== "admin") {
        throw new Error("Admin role required.");
      }
      const { data, error } = await supabase
        .from("organization_members")
        .update(updates)
        .eq("id", updateId)
        .eq("organization_id", organizationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
    },
  });
};

export const useRemoveOrganizationMember = () => {
  const { supabase, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      removeId,
      organizationId,
    }: {
      removeId: string;
      organizationId: string;
    }) => {
      const { data: currentMember } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user?.id)
        .eq("organization_id", organizationId)
        .single();

      if (currentMember?.role !== "admin") {
        throw new Error("Admin role required.");
      }

      const { error } = await supabase.from("organization_members").delete().eq("id", removeId);

      if (error) throw error;
      return { removeId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
    },
  });
};

// 프리페칭
export const usePrefetchOrganizationMembers = () => {
  const { user, supabase } = useAuth();
  const queryClient = useQueryClient();

  const prefetchMembers = async (orgId?: string) => {
    if (orgId) {
      await queryClient.prefetchQuery({
        queryKey: orgKeys.byOrg(orgId),
        queryFn: async () => {
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
        queryKey: orgKeys.byUser(user.id),
        queryFn: async () => {
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

/*

// 8. 멤버 추가
const addMember = useAddOrganizationMember();

const handleAddMember = async () => {
  try {
    await addMember.mutateAsync({
      user_id: "user-456",
      organization_id: "org-123",
      role: "member",
    });
  } catch (error) {
    console.error("Failed to add member:", error);
  }
};

// 9. 멤버 업데이트
const updateMember = useUpdateOrganizationMember();

const handleUpdateRole = async (memberId: string) => {
  try {
    await updateMember.mutateAsync({
      id: memberId,
      updates: { role: "admin" }
    });
  } catch (error) {
    console.error("Failed to update member:", error);
  }
};

// 10. 멤버 삭제
const removeMember = useRemoveOrganizationMember();

const handleRemoveMember = async (memberId: string) => {
  try {
    await removeMember.mutateAsync(memberId);
  } catch (error) {
    console.error("Failed to remove member:", error);
  }
};

// 11. 프리페칭 사용
const { prefetchMembers } = usePrefetchOrganizationMembers();

const handleHoverOrgCard = (orgId: string) => {
  // 사용자가 조직 카드에 호버할 때 미리 데이터 로드
  prefetchMembers(orgId);
};

const handlePageLoad = () => {
  // 페이지 로드 시 현재 사용자의 멤버십 미리 로드
  prefetchMembers();
};
 
*/
