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
  byRole: (orgId: string, role: string) => [...orgKeys.byOrg(orgId), "role", role] as const,
};

// 현재 사용자의 조직 멤버십 (제네릭 타입 지원)
export const useOrganizationMembers = <T = OrgMember>(
  select?: string
): QueryResult<T> => {
  const { user, supabase } = useAuth();

  const result = useQuery({
    queryKey: [...orgKeys.byUser(user?.id || ""), select || "*"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(select || "*")
        .eq("user_id", user!.id);

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

// 특정 조직의 모든 멤버들
export const useOrganizationMembersByOrgId = <T = OrgMember>(
  orgId: string,
  select = "*"
): QueryResult<T> => {
  const { supabase } = useAuth();

  const result = useQuery({
    queryKey: [...orgKeys.byOrg(orgId), select],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(select)
        .eq("organization_id", orgId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: result.data as T[],
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    refetch: result.refetch,
  };
};

// 특정 역할의 멤버들
export const useOrganizationMembersByRole = <T = OrgMember>(
  orgId: string,
  role: string,
  select = "*"
): QueryResult<T> => {
  const { supabase } = useAuth();

  const result = useQuery({
    queryKey: [...orgKeys.byRole(orgId, role), select],
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

// 멤버 업데이트
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
    },
  });
};

// 멤버 삭제
export const useRemoveOrganizationMember = () => {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organization_members").delete().eq("id", id);

      if (error) throw error;
      return { id };
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


// 1. 기본 사용법 (모든 필드)
const {
  data: orgMembers = [],
  isLoading,
  error,
  isFetching,
  refetch,
} = useOrganizationMembers();

// 2. 조인 쿼리 사용법
type OrgMemberWithOrg = OrgMember & {
  organizations: {
    name: string;
    description: string;
  };
};

const {
  data: orgMembers = [],
  isLoading,
  error: orgError,
  isFetching,
  refetch,
} = useOrganizationMembers<OrgMemberWithOrg>(`
  id, role, created_at,
  organizations:organization_id(name, description)
`);

// 3. 특정 필드만 선택
type MemberBasic = {
  id: string;
  role: string;
  user_id: string;
};

const {
  data: basicMembers = [],
  isLoading,
} = useOrganizationMembers<MemberBasic>("id, role, user_id");

// 4. 특정 조직의 멤버들 조회
const {
  data: teamMembers = [],
  isLoading: membersLoading,
} = useOrganizationMembersByOrgId<OrgMember>("org-123");

// 5. 조직 멤버들 + 사용자 정보 조인
type MemberWithUser = OrgMember & {
  users: {
    email: string;
    full_name: string;
  };
};

const {
  data: membersWithUsers = [],
} = useOrganizationMembersByOrgId<MemberWithUser>(
  "org-123",
  `*, users:user_id(email, full_name)`
);

// 6. 특정 역할의 멤버들만 조회
const {
  data: admins = [],
  isLoading: adminsLoading,
} = useOrganizationMembersByRole<OrgMember>("org-123", "admin");

// 7. 관리자들 + 조직 정보
const {
  data: adminWithOrg = [],
} = useOrganizationMembersByRole<OrgMemberWithOrg>(
  "org-123", 
  "admin",
  `*, organizations:organization_id(name, description)`
);

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

// 12. React 컴포넌트에서 실제 사용 예시
function OrganizationMembersPage() {
  const {
    data: orgMembers = [],
    isLoading,
    error,
    refetch,
  } = useOrganizationMembers<OrgMemberWithOrg>(`
    id, role, created_at,
    organizations:organization_id(name, description)
  `);

  const addMember = useAddOrganizationMember();
  const updateMember = useUpdateOrganizationMember();
  const removeMember = useRemoveOrganizationMember();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>My Organizations</h1>
      {orgMembers.map((member) => (
        <div key={member.id}>
          <h3>{member.organizations.name}</h3>
          <p>Role: {member.role}</p>
          <p>Joined: {new Date(member.created_at).toLocaleDateString()}</p>
          
          <button
            onClick={() => updateMember.mutate({
              id: member.id,
              updates: { role: member.role === "admin" ? "member" : "admin" }
            })}
            disabled={updateMember.isPending}
          >
            Toggle Role
          </button>
          
          <button
            onClick={() => removeMember.mutate(member.id)}
            disabled={removeMember.isPending}
          >
            Leave Organization
          </button>
        </div>
      ))}
      
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// 13. 조건부 쿼리 사용
function TeamMembersPage({ orgId }: { orgId?: string }) {
  const {
    data: members = [],
    isLoading,
  } = useOrganizationMembersByOrgId<MemberWithUser>(
    orgId || "",  // orgId가 없으면 빈 문자열
    `*, users:user_id(email, full_name)`
  );

  // orgId가 없으면 쿼리가 비활성화됨 (enabled: !!orgId)
  if (!orgId) return <div>Please select an organization</div>;
  if (isLoading) return <div>Loading members...</div>;

  return (
    <div>
      {members.map((member) => (
        <div key={member.id}>
          <span>{member.users.full_name}</span>
          <span>{member.users.email}</span>
          <span>{member.role}</span>
        </div>
      ))}
    </div>
  );
}

// 14. 에러 핸들링 예시
function MembersWithErrorHandling() {
  const {
    data: members = [],
    error,
    isLoading,
    refetch,
  } = useOrganizationMembers();

  const addMember = useAddOrganizationMember();

  const handleAddMember = async (userData: any) => {
    try {
      await addMember.mutateAsync(userData);
      // 성공 시 알림 표시
      alert("Member added successfully!");
    } catch (error) {
      // 에러 시 상세 메시지 표시
      if (error instanceof Error) {
        alert(`Failed to add member: ${error.message}`);
      }
    }
  };

  if (error) {
    return (
      <div>
        <p>Failed to load members: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

 
*/
