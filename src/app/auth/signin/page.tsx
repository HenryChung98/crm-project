"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "./action";
import { signInWithGoogle } from "./signInWIthGoogle";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// icons
import { BiShow, BiHide } from "react-icons/bi";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

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
    <>
      <Form action={handleSubmit} formTitle="Sign in">
        <FormField
          type="email"
          placeholder="Email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm px-2 py-1"
            >
              {showPassword ? <BiShow size={20} /> : <BiHide size={20} />}
            </button>
            <Link href="/auth/signin/reset-password" className="text-blue-500 hover:underline">
              reset password?
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <Button type="submit">Sign in</Button>
            <Button type="button" onClick={signInWithGoogle} variant="secondary">
              Continue with Google
            </Button>
            <p className="text-sm text-center mt-5 border-t pt-2">Don&apos;t have an account?</p>
            <Button type="button" onClick={() => router.push("/auth/signup")}>
              Sign up
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
}
