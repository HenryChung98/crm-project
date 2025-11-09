import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

// this api is for OAuth (google)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Exchange code error:", error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_failed`);
    }

    console.log("Session created:", data.session?.user?.email);
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/callback/confirmed`);
}
