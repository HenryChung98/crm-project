// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import type { Database } from "@/types/supabase";
// import { useAuth } from "@/contexts/AuthContext";
// import { NetworkError } from "@/types/errors";

// type OrgMember = Database["public"]["Tables"]["organizations"]["Row"];

// export type QueryResult<T> = {
//   data: T[];
//   error: Error | null;
//   isLoading: boolean;
//   isFetching: boolean;
//   // isRefetching: boolean;
//   // isSuccess: boolean;
//   // isError: boolean;
//   // isStale: boolean;
//   // status: "idle" | "loading" | "error" | "success";
//   refetch: () => void;
// };

// export const orgKeys = {
//   all: ["organizations"] as const,
//   byUser: (userId: string) => [...orgKeys.all, "user", userId] as const,
//   byOrg: (orgId: string) => [...orgKeys.all, "org", orgId] as const,
// };

// // 현재 사용자의 조직 멤버십 (제네릭 타입 지원)
// export const useOrganizationMembers = <T = OrgMember>(select?: string): QueryResult<T> => {
//   const { user, supabase } = useAuth();

//   const result = useQuery({
//     queryKey: [...orgKeys.byUser(user?.id || ""), select || "*"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("organizations")
//         .select(select || "*")
//         .eq("user_id", user!.id);

//       if (error) throw error;
//       return data || [];
//     },
//     enabled: !!user,
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: true,
//     retry: (failureCount, error: NetworkError) => {
//       if (error?.code === "PGRST301") return false;
//       return failureCount < 3;
//     },
//   });

//   return {
//     data: result.data as T[],
//     error: result.error,
//     isLoading: result.isLoading,
//     isFetching: result.isFetching,
//     refetch: result.refetch,
//   };
// };

// // 특정 조직의 모든 멤버들
// export const useOrganizationMembersByOrgId = <T = OrgMember>(
//   orgId: string,
//   select = "*"
// ): QueryResult<T> => {
//   const { supabase } = useAuth();

//   const result = useQuery({
//     queryKey: [...orgKeys.byOrg(orgId), select],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("organizations")
//         .select(select)
//         .eq("organization_id", orgId);

//       if (error) throw error;
//       return data || [];
//     },
//     enabled: !!orgId,
//     staleTime: 2 * 60 * 1000,
//   });

//   return {
//     data: result.data as T[],
//     error: result.error,
//     isLoading: result.isLoading,
//     isFetching: result.isFetching,
//     refetch: result.refetch,
//   };
// };


// // 멤버 추가
// export const useAddOrganizationMember = () => {
//   const { supabase } = useAuth();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newMember: Omit<OrgMember, "id" | "created_at">) => {
//       const { data, error } = await supabase
//         .from("organizations")
//         .insert(newMember)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: orgKeys.all });
//     },
//   });
// };

// // 멤버 업데이트
// export const useUpdateOrganizationMember = () => {
//   const { supabase } = useAuth();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, updates }: { id: string; updates: Partial<OrgMember> }) => {
//       const { data, error } = await supabase
//         .from("organizations")
//         .update(updates)
//         .eq("id", id)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: orgKeys.all });
//     },
//   });
// };

// // 멤버 삭제
// export const useRemoveOrganizationMember = () => {
//   const { supabase } = useAuth();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase.from("organizations").delete().eq("id", id);

//       if (error) throw error;
//       return { id };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: orgKeys.all });
//     },
//   });
// };

// // 프리페칭
// export const usePrefetchOrganizationMembers = () => {
//   const { user, supabase } = useAuth();
//   const queryClient = useQueryClient();

//   const prefetchMembers = async (orgId?: string) => {
//     if (orgId) {
//       await queryClient.prefetchQuery({
//         queryKey: orgKeys.byOrg(orgId),
//         queryFn: async () => {
//           const { data, error } = await supabase
//             .from("organizations")
//             .select("*")
//             .eq("organization_id", orgId);

//           if (error) throw error;
//           return data || [];
//         },
//         staleTime: 2 * 60 * 1000,
//       });
//     } else if (user) {
//       await queryClient.prefetchQuery({
//         queryKey: orgKeys.byUser(user.id),
//         queryFn: async () => {
//           const { data, error } = await supabase
//             .from("organizations")
//             .select("*")
//             .eq("user_id", user.id);

//           if (error) throw error;
//           return data || [];
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     }
//   };

//   return { prefetchMembers };
// };
