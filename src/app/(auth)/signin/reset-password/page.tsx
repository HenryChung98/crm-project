"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  const { supabase, isAuthenticated } = useSupabase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data: resetData, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/callback/reset-password`,
      });
      if (!email) {
        setError("type your email");
        setSuccess(false);
      }
      if (error) {
        setError("Failed to send reset password: " + error.message);
        setSuccess(false);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("network error");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <form onSubmit={handleUpdatePassword} className="w-1/3 m-auto">
      <h1 className="text-xl font-semibold">reset password</h1>
      <div className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="type your email"
          value={email}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
        {success && <p className="text-green-600">Check your email.</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          send reset email
        </button>
        <Link href="/signin">go back</Link>
      </div>
    </form>
  );
}
