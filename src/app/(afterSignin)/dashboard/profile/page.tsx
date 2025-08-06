"use client";

// import { useOrganizationMembers } from "@/hooks/fetchData/useOrganizationMembers";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";
export default function ProfilePage() {
  const { user } = useAuth();
  // const { orgMembers, orgError, isLoading } = useOrganizationMembers();
  const {
    data: orgMembers = [], // 기본값 설정으로 undefined 방지
    error: orgError,
    isLoading,
    isFetching, // 백그라운드 업데이트 중인지
    refetch, // 수동 새로고침용
  } = useOrganizationMembers<
    "id" | "organization_id" | "organization_name" | "role" | "created_at"
  >(["id", "organization_id", "organization_name", "role", "created_at"]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">User Profile</h1>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            {user?.first_name}, {user?.last_name}, {user?.email},{user?.image}
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </label>
          {/* 로딩 상태 표시 */}
          {isLoading && <div className="text-blue-500">멤버십 정보를 불러오는 중...</div>}
          {/*  */}
          {/* 백그라운드 업데이트 표시 */}
          {isFetching && !isLoading && <div className="text-blue-400 text-sm">업데이트 중...</div>}
          {/*  */}
          {/* 에러 처리 */}
          {orgError && (
            <div className="text-red-500">
              오류: {orgError instanceof Error ? orgError.message : "알 수 없는 오류"}
              <button onClick={() => refetch()} className="ml-2 text-blue-500 underline">
                다시 시도
              </button>
            </div>
          )}
          {/*  */}

          {/* 멤버십 목록 표시 */}
          {!isLoading && orgMembers.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">내 조직 멤버십:</h3>
              {orgMembers.map((membership) => (
                <div key={membership.id} className="p-2 bg-gray-50 rounded">
                  <div className="text-green-600 font-medium">
                    조직: {membership.organization_name}
                  </div>
                  <div className="text-sm text-gray-600">역할: {membership.role}</div>
                  <div className="text-xs text-gray-500">
                    가입일: {new Date(membership.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/*  */}
          {/* 멤버십이 없는 경우 */}
          {!isLoading && !orgError && orgMembers.length === 0 && (
            <div className="text-gray-500 italic">아직 가입한 조직이 없습니다.</div>
          )}
          {/* </div> */}

          {/* 수동 새로고침 버튼 */}
          <div className="mb-4">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
            >
              {isFetching ? "새로고침 중..." : "멤버십 새로고침"}
            </button>
          </div>
          {/*  */}
          <div className="text-red-500">
            {orgMembers.map((membership) => (
              <div key={membership.id} className="text-green-600">
                Role: {membership.role}
              </div>
            ))}
          </div>
          <Link href="/dashboard/create-organization" className="text-blue-500">
            create organization
          </Link>
        </div>
        <div className="mb-4"></div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// components/OrganizationMembersList.tsx (사용 예제)
// import React from 'react';
// import {
//   useOrganizationMembers,
//   useOrganizationMembersByOrgId,
//   useAddOrganizationMember,
//   useUpdateOrganizationMember,
//   useRemoveOrganizationMember,
//   usePrefetchOrganizationMembers
// } from '@/hooks/useOrganizationMembers';

// export const OrganizationMembersList = ({ organizationId }: { organizationId?: string }) => {
//   // 1. 기본 사용법 - 현재 사용자의 모든 멤버십
//   const {
//     data: myMemberships,
//     isLoading,
//     error,
//     refetch,
//     isFetching // 백그라운드에서 업데이트 중인지
//   } = useOrganizationMembers("id, organization_id, organization_name, role, created_at");

//   // 2. 특정 조직의 모든 멤버 (관리자용)
//   const {
//     data: orgMembers,
//     isLoading: isLoadingOrgMembers
//   } = useOrganizationMembersByOrgId(
//     organizationId || '',
//     "*, users(id, email, full_name, avatar_url)"
//   );

//   // 3. Mutation 훅들
//   const addMember = useAddOrganizationMember();
//   const updateMember = useUpdateOrganizationMember();
//   const removeMember = useRemoveOrganizationMember();

//   // 4. 프리페칭
//   const { prefetchMembers } = usePrefetchOrganizationMembers();

//   // 멤버 추가
//   const handleAddMember = async (email: string, role: string) => {
//     try {
//       await addMember.mutateAsync({
//         user_id: 'user-id', // 실제로는 초대된 사용자 ID
//         organization_id: organizationId!,
//         organization_name: 'Org Name',
//         invited_by: 'current-user-id',
//         role
//       });
//       // 성공 시 자동으로 캐시 업데이트됨
//       console.log('Member added successfully!');
//     } catch (error) {
//       console.error('Failed to add member:', error);
//     }
//   };

//   // 역할 변경
//   const handleRoleChange = async (memberId: string, newRole: string) => {
//     try {
//       await updateMember.mutateAsync({
//         id: memberId,
//         updates: { role: newRole }
//       });
//       console.log('Role updated successfully!');
//     } catch (error) {
//       console.error('Failed to update role:', error);
//     }
//   };

//   // 멤버 제거
//   const handleRemoveMember = async (memberId: string) => {
//     if (confirm('정말로 이 멤버를 제거하시겠습니까?')) {
//       try {
//         await removeMember.mutateAsync(memberId);
//         console.log('Member removed successfully!');
//       } catch (error) {
//         console.error('Failed to remove member:', error);
//       }
//     }
//   };

//   // 다른 조직 데이터 미리 로드
//   const handleHoverOrganization = (orgId: string) => {
//     prefetchMembers(orgId);
//   };

//   if (isLoading) return <div>멤버 정보를 불러오는 중...</div>;
//   if (error) return <div>오류: {error.message}</div>;

//   return (
//     <div className="space-y-6">
//       {/* 현재 사용자의 멤버십 */}
//       <section>
//         <div className="flex items-center gap-2 mb-4">
//           <h2 className="text-xl font-bold">내 조직 멤버십</h2>
//           {isFetching && <span className="text-sm text-gray-500">업데이트 중...</span>}
//           <button
//             onClick={() => refetch()}
//             className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
//           >
//             새로고침
//           </button>
//         </div>

//         {myMemberships?.map(membership => (
//           <div
//             key={membership.id}
//             className="p-3 border rounded"
//             onMouseEnter={() => handleHoverOrganization(membership.organization_id)}
//           >
//             <h3>{membership.organization_name}</h3>
//             <p>역할: {membership.role}</p>
//             <p>가입일: {new Date(membership.created_at).toLocaleDateString()}</p>
//           </div>
//         ))}
//       </section>

//       {/* 특정 조직의 멤버들 (관리자용) */}
//       {organizationId && (
//         <section>
//           <h2 className="text-xl font-bold mb-4">조직 멤버 관리</h2>

//           {isLoadingOrgMembers ? (
//             <div>멤버 목록을 불러오는 중...</div>
//           ) : (
//             <div className="space-y-2">
//               {orgMembers?.map(member => (
//                 <div key={member.id} className="flex items-center justify-between p-3 border rounded">
//                   <div>
//                     <p className="font-medium">{member.users?.full_name || member.users?.email}</p>
//                     <p className="text-sm text-gray-600">역할: {member.role}</p>
//                   </div>

//                   <div className="flex gap-2">
//                     <select
//                       value={member.role}
//                       onChange={(e) => handleRoleChange(member.id, e.target.value)}
//                       disabled={updateMember.isPending}
//                       className="px-2 py-1 border rounded"
//                     >
//                       <option value="member">멤버</option>
//                       <option value="admin">관리자</option>
//                       <option value="owner">소유자</option>
//                     </select>

//                     <button
//                       onClick={() => handleRemoveMember(member.id)}
//                       disabled={removeMember.isPending}
//                       className="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
//                     >
//                       제거
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               {/* 새 멤버 추가 버튼 */}
//               <button
//                 onClick={() => handleAddMember('new@example.com', 'member')}
//                 disabled={addMember.isPending}
//                 className="w-full p-2 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 disabled:opacity-50"
//               >
//                 {addMember.isPending ? '추가 중...' : '+ 새 멤버 초대'}
//               </button>
//             </div>
//           )}
//         </section>
//       )}

//       {/* 로딩/에러 상태 표시 */}
//       <div className="text-sm text-gray-500">
//         {addMember.isPending && <p>멤버 추가 중...</p>}
//         {updateMember.isPending && <p>역할 변경 중...</p>}
//         {removeMember.isPending && <p>멤버 제거 중...</p>}
//       </div>
//     </div>
//   );
// };

// // 추가적인 유틸리티 훅들
// export const useOrganizationStats = (orgId: string) => {
//   const { data: members } = useOrganizationMembersByOrgId(orgId);

//   const stats = React.useMemo(() => {
//     if (!members) return null;

//     return {
//       total: members.length,
//       admins: members.filter(m => m.role === 'admin').length,
//       members: members.filter(m => m.role === 'member').length,
//       owners: members.filter(m => m.role === 'owner').length,
//     };
//   }, [members]);

//   return stats;
// };
