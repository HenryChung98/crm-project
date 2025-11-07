"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState<string>("");
  const router = useRouter();
  const { supabase, isAuthenticated } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback/reset-password`,
      });
      if (!email) {
        showError("Type your email");
      }
      if (error) {
        showError("Failed to send reset password: " + error.message);
      } else {
        showSuccess("Password is successfully reset. Check your email.");
      }
    } catch (err) {
      showError("Network error");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Form onSubmit={handleUpdatePassword} formTitle="reset password">
        <FormField
          label="Type your email"
          type="email"
          name="email"
          placeholder="type your email"
          value={email}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
        <Button type="submit"> send reset email</Button>
        <Button>
          <Link href="/auth/signin">go back</Link>
        </Button>
      </Form>
    </>
  );
}
