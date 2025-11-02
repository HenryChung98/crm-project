"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function signIn(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log("Sign in error:", signInError); // 디버깅용

      // 더 정확한 에러 메시지 체크
      if (
        signInError.message.includes("Invalid login credentials") ||
        signInError.message.includes("invalid_credentials")
      ) {
        return { success: false, error: "Invalid email or password." };
      }

      if (
        signInError.message.includes("Email not confirmed") ||
        signInError.message.includes("signup_not_confirmed")
      ) {
        await supabase.auth.resend({
          type: "signup",
          email: email,
        });
        await supabase.auth.signOut();

        return {
          success: false,
          error: "Email is not confirmed. Check your email.\nConfirm email has been resent.",
        };
      }

      return { success: false, error: signInError.message };
    }

    // 성공시 revalidate만 하고 redirect는 클라이언트에서 처리
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Sign in catch error:", error); // 디버깅용
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
