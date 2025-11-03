"use server";
// fixx
import { redirect } from "next/navigation";
import { createClient } from "@/shared-utils/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const confirmPassword = formData.get("confirmPassword")?.toString().trim();

  // check all fields
  if (!email || !password || !firstName || !lastName) {
    return { error: "Email, password, and name are required." };
  }

  // validate password
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!pwRegex.test(password)) {
    return {
      error: "Password must be at least 8 characters long and contain letters and numbers.",
    };
  }

  // insert user to auth.users
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback/confirmed`,
    },
  });

  if (signUpError) {
    const msg = signUpError.message;

    if (msg.includes("duplicate")) {
      return { error: "Email already exist." };
    }
    return { error: msg };
  }
  if (!authData.user?.id) {
    return { error: "Signup failed: missing user ID." };
  }

  redirect("/auth/verify");
}
