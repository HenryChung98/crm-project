"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("OAuth failed:", error.message);
    redirect("/auth/signin?error=Google_OAuth_failed");
  }

  if (data?.url) {
    redirect(data.url);
  }
}
