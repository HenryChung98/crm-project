// // utils/serverAuth.ts
// import { createClient } from "@/utils/supabase/server";
// import { User } from "@supabase/supabase-js";
// import { useAuth } from "@/contexts/AuthContext";

// // 타입 정의
// export interface UserWithPlan {
//   id: string;
//   subscription_status: string | null;
//   subscription_ends_at: string | null;
//   plan_id: string | null;
//   plans: {
//     id: string;
//     name: string;
//     max_organizations: number;
//     max_members: number;
//     max_customers: number;
//   } | null;
// }

// export type ActionType = "create" | "update" | "delete" | "write";

// /**
//  * Server Action에서 읽기전용 모드 체크
//  */
// export async function checkReadOnlyMode(actionType: ActionType = "write"): Promise<UserWithPlan> {
//   const { supabase, user } = useAuth();

//   if (!user) {
//     throw new Error("Unauthorized.");
//   }

//   const { data: userData, error: userError } = await supabase
//     .from("users")
//     .select(
//       `
//       id,
//       subscription_status,
//       subscription_ends_at,
//       plan_id,
//       plans (
//         id,
//         name,
//         max_organizations,
//         max_members,
//         max_customers
//       )
//     `
//     )
//     .eq("id", user.id)
//     .single();

//   if (userError || !userData) {
//     throw new Error("사용자 정보를 찾을 수 없습니다.");
//   }

//   // 무료플랜이 아닌 경우 만료 체크
//   if (userData.subscription_status !== "free") {
//     const isExpired =
//       userData.subscription_ends_at && new Date(userData.subscription_ends_at) < new Date();

//     if (isExpired) {
//       throw new Error("구독이 만료되었습니다. 플랜을 업그레이드해주세요.");
//     }
//   }

//   return userData as UserWithPlan;
// }

// /**
//  * 생성 액션용 (더 엄격한 체크)
//  */
// export async function requireCreateAccess(): Promise<UserWithPlan> {
//   const userData = await checkReadOnlyMode("create");

//   // 추가적인 생성 권한 체크 로직 가능
//   // 예: 플랜별 생성 한도 체크 등

//   return userData;
// }

// /**
//  * 업데이트 액션용
//  */
// export async function requireUpdateAccess(): Promise<UserWithPlan> {
//   const userData = await checkReadOnlyMode("update");
//   return userData;
// }

// /**
//  * 삭제 액션용 (읽기전용 모드에서도 허용할 수 있음)
//  */
// export async function requireDeleteAccess(): Promise<UserWithPlan> {
//   const supabase = createClient();

//   const {
//     data: { user },
//     error: authError,
//   } = await supabase.auth.getUser();
//   if (authError || !user) {
//     throw new Error("로그인이 필요합니다.");
//   }

//   // 삭제는 읽기전용 모드에서도 허용 (한도 맞추기 위해)
//   const { data: userData, error: userError } = await supabase
//     .from("users")
//     .select(
//       `
//       id,
//       subscription_status,
//       subscription_ends_at,
//       plan_id,
//       plans (
//         id,
//         name,
//         max_organizations,
//         max_members,
//         max_customers
//       )
//     `
//     )
//     .eq("id", user.id)
//     .single();

//   if (userError || !userData) {
//     throw new Error("사용자 정보를 찾을 수 없습니다.");
//   }

//   return userData as UserWithPlan;
// }

// // 사용 예시:
// /*
// // actions/createCustomer.ts
// export async function createCustomer(formData: FormData): Promise<void> {
//   const userData = await requireCreateAccess();
  
//   // 실제 고객 생성 로직
//   const supabase = createClient();
//   const { error } = await supabase
//     .from("customers")
//     .insert({
//       name: formData.get("name") as string,
//       user_id: userData.id
//     });
    
//   if (error) throw error;
// }

// // actions/updateCustomer.ts  
// export async function updateCustomer(id: string, formData: FormData): Promise<void> {
//   const userData = await requireUpdateAccess();
  
//   // 실제 고객 수정 로직
// }

// // actions/deleteCustomer.ts
// export async function deleteCustomer(id: string): Promise<void> {
//   const userData = await requireDeleteAccess();
  
//   // 실제 고객 삭제 로직 (읽기전용 모드에서도 허용)
// }
// */
