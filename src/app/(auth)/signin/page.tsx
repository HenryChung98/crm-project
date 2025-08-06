"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "./action";
import { signInWithGoogle } from "./signInWIthGoogle";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
interface SignInFormData {
  email: string;
  password: string;
}

export default function SigninPage() {
  // Show password state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refetchUser } = useAuth();
  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) {
      setError(null);
    }
  };

  // handle sign in
  const handleSubmit = async (formData: FormData) => {
    const res = await signIn(formData);

    if (res?.error) {
      setError(res.error);
    }

    refetchUser();
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <form action={handleSubmit} className="space-y-3">
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border px-2 py-1"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-2">
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Sign in
          </button>
          <button
            type="button"
            className="w-full bg-gray-800 p-2 rounded"
            onClick={signInWithGoogle}
          >
            continue with Google
          </button>
          <div onClick={() => setShowPassword(!showPassword)}>show passwords</div>
          <Link href="/signup" className="block text-center text-blue-500 underline">
            sign up
          </Link>
        </div>
      </form>

      <Link href="/signin/reset-password" className="w-full bg-blue-600 text-white p-2 rounded">
        reset password?
      </Link>
    </div>
  );
}
