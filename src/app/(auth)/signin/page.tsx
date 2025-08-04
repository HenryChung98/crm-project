"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SigninPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null); // Error message state
  const [resetPassword, setResetPassword] = useState(false); // Reset password state
  const [success, setSuccess] = useState(false); // Success message state for reset password
  const [showPassword, setShowPassword] = useState<boolean>(false); // Show password state
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [googleLoading, setGoogleLoading] = useState(false); // Loading state for Google login

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(`ERROR!: ${result.error}` || "Failed to sign in");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("network error");
    } finally {
      setLoading(false);
    }
  };

  // Function to send reset password email
  const sendResetPassword = async () => {
    setError(null);
    if (!data.email) {
      setError("type your email.");
      return;
    }

    try {
      // Send reset password email
      const { data: resetData, error } =
        await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/callback/reset-password`,
        });

      if (error) {
        setError("Failed to send reset password: " + error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("network error");
    }
  };

  // Function to handle Google login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`, 
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth login failed:", error.message);
      }
    } catch (err) {
      console.error("Unexpected error during Google login:", err);
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded space-y-4">
      {!resetPassword ? (
        <>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1"
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? "logging in..." : "login"}
              </button>
              <button
                type="button"
                className="w-full bg-gray-800 p-2 rounded"
                onClick={handleGoogleLogin}
              >
                continue with Google
              </button>
              <div onClick={() => setShowPassword(!showPassword)}>
                show passwords
              </div>
              <Link
                href="/signup"
                className="block text-center text-blue-500 underline"
              >
                sign up
              </Link>
            </div>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold">reset password</h1>
          <div className="space-y-3">
            <input
              type="email"
              name="email"
              placeholder="type your email"
              value={data.email}
              onChange={handleChange}
              required
              className="w-full border px-2 py-1"
            />
            {success && <p className="text-green-600">check your email.</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={sendResetPassword}
              className="w-full bg-blue-600 text-white p-2 rounded"
            >
              send reset email
            </button>
          </div>
        </>
      )}
      <p
        onClick={() => {
          setResetPassword(!resetPassword);
          setSuccess(false);
          setError(null);
        }}
        className="text-sm text-blue-500 cursor-pointer underline text-center mt-4"
      >
        {resetPassword ? "← back to sign in" : "reset password?"}
      </p>
    </div>
  );
}
