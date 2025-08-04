import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  // 유저 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, email, user_metadata } = user;

  // 기존 유저 확인
  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    console.error("DB fetch error:", existingError.message);
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existing) {
    const full_name = user_metadata?.full_name || "";
    const [first_name = "", last_name = ""] = full_name.split(" ");

    const image = user_metadata?.picture || "";
    const role = "customer";

    const { error: insertError } = await supabase.from("users").insert({
      id,
      email,
      first_name,
      last_name,
      image,
      role,
    });

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.redirect(url.origin);
}
