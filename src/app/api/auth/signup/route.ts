import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const url = new URL(req.url);
    const formData = await req.json();
    const { email, password, firstName, lastName } = formData;

    // ✅ 1. 필수 필드 확인
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    // ✅ 2. 비밀번호 유효성 검사
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwRegex.test(password)) {
      return NextResponse.json(
        { error: "Passwords must be at least 8 characters long and contain letters and numbers." },
        { status: 400 }
      );
    }

    // ✅ 5. Supabase Auth 회원가입
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${url.origin}/callback/confirmed`,
      },
    });

    if (signUpError) {
      const msg = signUpError.message;

      if (msg.includes("duplicate")) {
        return NextResponse.json({ error: "Email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!signUpData.user?.id) {
      return NextResponse.json({ error: "Signup failed: missing user ID." }, { status: 500 });
    }

    // ✅ 6. public.users 테이블에 사용자 프로필 추가
    // const userProfile = {
    //   id: signUpData.user.id,
    //   email,
    //   first_name: firstName.trim(),
    //   last_name: lastName.trim(),
    //   role: "owner",
    // };

    // const { error: profileError } = await supabase.from("users").insert([userProfile]);

    // if (profileError) {
    //   const msg = profileError.message;

    //   if (msg.includes("users_email_key")) return errorResponse("Email already exists.", 409);

    //   return errorResponse(msg, 400);
    // }

    // ✅ 7. 성공 응답
    return NextResponse.json({ user: signUpData.user });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
