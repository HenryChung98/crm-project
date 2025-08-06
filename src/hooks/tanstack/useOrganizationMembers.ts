// hooks/useOrganizationMembers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkError } from "@/types/errors";
import type { SupabaseClient } from "@supabase/supabase-js";

type OrgMember = Database["public"]["Tables"]["organization_members"]["Row"];

// 쿼리 키 팩토리 (일관된 키 관리)
export const orgMembersKeys = {
  all: ["organizationMembers"] as const,
  byUser: (userId: string) => [...orgMembersKeys.all, "user", userId] as const,
  byUserWithSelect: (userId: string, select: string) =>
    [...orgMembersKeys.byUser(userId), "select", select] as const,
  byOrg: (orgId: string) => [...orgMembersKeys.all, "org", orgId] as const,
  byRole: (orgId: string, role: string) => [...orgMembersKeys.byOrg(orgId), "role", role] as const,
};

// API 함수들
const fetchOrganizationMembers = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  select: string = "*"
): Promise<OrgMember[]> => {
  const { data, error } = await supabase
    .from("organization_members")
    .select(select)
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
};

const fetchMembersByOrganization = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  select: string = "*"
): Promise<OrgMember[]> => {
  const { data, error } = await supabase
    .from("organization_members")
    .select(select)
    .eq("organization_id", orgId);

  if (error) throw error;
  return data || [];
};

// 기본 훅: 현재 사용자의 모든 조직 멤버십
export const useOrganizationMembers = (select: string = "*") => {
  const { user, supabase } = useAuth();

  return useQuery({
    queryKey: orgMembersKeys.byUserWithSelect(user?.id || "", select),
    queryFn: () => fetchOrganizationMembers(supabase, user!.id, select),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 데이터로 취급
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션 (구 cacheTime)
    refetchOnWindowFocus: true,
    retry: (failureCount, error: NetworkError) => {
      // 인증 오류는 재시도하지 않음
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  });
};

// 특정 조직의 모든 멤버들 (관리자용)
export const useOrganizationMembersByOrgId = (
  orgId: string,
  select: string = "*, users(id, email, full_name)"
) => {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: orgMembersKeys.byOrg(orgId),
    queryFn: () => fetchMembersByOrganization(supabase, orgId, select),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2분 (더 자주 업데이트될 수 있음)
    gcTime: 5 * 60 * 1000,
  });
};

// 특정 역할의 멤버들만
export const useOrganizationMembersByRole = (
  orgId: string,
  role: string,
  select: string = "*, users(id, email, full_name)"
) => {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: orgMembersKeys.byRole(orgId, role),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(select)
        .eq("organization_id", orgId)
        .eq("role", role);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId && !!role,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation 훅들 (데이터 변경용)
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
      // 관련된 모든 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: orgMembersKeys.byUser(variables.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: orgMembersKeys.byOrg(variables.organization_id),
      });

      // Optimistic update (선택사항)
      queryClient.setQueryData(
        orgMembersKeys.byUser(variables.user_id),
        (old: OrgMember[] | undefined) => (old ? [...old, data] : [data])
      );
    },
    onError: (error) => {
      console.error("Failed to add member:", error);
      // 토스트 알림 등 에러 처리
    },
  });
};

export const useUpdateOrganizationMember = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OrgMember> }) => {
      const { data, error } = await supabase
        .from("organization_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // 모든 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: orgMembersKeys.all,
      });

      // 또는 특정 쿼리만 업데이트
      queryClient.setQueriesData(
        { queryKey: orgMembersKeys.all },
        (old: OrgMember[] | undefined) => {
          if (!old) return old;
          return old.map((member) => (member.id === data.id ? { ...member, ...data } : member));
        }
      );
    },
  });
};

export const useRemoveOrganizationMember = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organization_members").delete().eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: (data) => {
      // 캐시에서 해당 멤버 제거
      queryClient.setQueriesData(
        { queryKey: orgMembersKeys.all },
        (old: OrgMember[] | undefined) => {
          if (!old) return old;
          return old.filter((member) => member.id !== data.id);
        }
      );
    },
  });
};

// 프리페칭 훅 (미리 데이터 로드)
export const usePrefetchOrganizationMembers = () => {
  const { user, supabase } = useAuth();
  const queryClient = useQueryClient();

  const prefetchMembers = (orgId?: string) => {
    if (orgId) {
      queryClient.prefetchQuery({
        queryKey: orgMembersKeys.byOrg(orgId),
        queryFn: () => fetchMembersByOrganization(supabase, orgId),
        staleTime: 2 * 60 * 1000,
      });
    } else if (user) {
      queryClient.prefetchQuery({
        queryKey: orgMembersKeys.byUser(user.id),
        queryFn: () => fetchOrganizationMembers(supabase, user.id),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return { prefetchMembers };
};
