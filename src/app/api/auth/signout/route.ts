import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    // Get cookies first
    const cookiesStore = await cookies();

    const supabase = createRouteHandlerClient({
      cookies: async () => cookiesStore, // Make the function async
    });

    // Handle sign out with error handling
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 }
      );
    }

    // Use 302 (temporary redirect) instead of 301 (permanent redirect)
    // and redirect to a specific sign-in page or home page
    return NextResponse.redirect(`${url.origin}`, {
      status: 302,
    });
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
