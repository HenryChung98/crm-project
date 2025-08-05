"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function acceptInviteAction(code: string) {
  const supabase = await createClient();

  const { data: inviteData, error: inviteError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("id", code)
    .maybeSingle();

  if (inviteError) {
    return { error: inviteError.message };
  }
  if (!inviteData) {
    return { error: "Invitation not found." };
  }
  if (inviteData.expires_at < new Date(Date.now())) {
    return { error: "Expired." };
  }

//   ??

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", inviteData.email)
    .maybeSingle();

  redirect("/");
  // 1. organization_invitations 테이블에서 코드 찾기
  // 2. 초대가 유효한지 확인 (expires_at, accepted 상태)
  // 3. 현재 로그인한 사용자를 해당 조직에 추가
  // 4. 초대 상태를 accepted로 업데이트
}

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// export async function GET(request: Request) {
//   const url = new URL(request.url);
//   const code = url.searchParams.get("code");

//   if (!code) {
//     redirect("/error?msg=invalid-invite");
//   }

//   // ✅ invite_code를 HTTP-only 쿠키로 저장
//   cookies().set("invite_code", code, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 60 * 10, // 10분간 유효
//   });

//   // ✅ 회원가입 페이지로 리디렉션
//   redirect("/signup");
// }