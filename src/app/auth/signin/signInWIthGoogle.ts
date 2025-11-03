"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/shared-utils/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("OAuth failed:", error.message);
    redirect("/auth/login?error=Google_OAuth_failed");
  }

  if (data?.url) {
    redirect(data.url);
  }
}
