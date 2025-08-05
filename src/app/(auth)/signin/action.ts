"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    if (signInError.message.includes("Invalid login")) {
      return { success: false, error: "Invalid email or password." };
    }
    if (signInError.message.includes("Email not confirmed")) {
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

  revalidatePath("/", "layout");
  redirect("/");
}
