"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "./action";
import { signInWithGoogle } from "./signInWIthGoogle";
import { useRouter } from "next/navigation";

// icons
import { BiShow, BiHide } from "react-icons/bi";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showError } from "@/components/feedback";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle sign in
  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    try {
      const res = await signIn(formData);

      if (res?.error) {
        showError(res.error);
        setIsLoading(false);
        return;
      }

      if (res?.success) {
        // Use window.location to ensure cookies are set and session is available
        window.location.href = "/orgs";
      }
    } catch (error) {
      showError(`Sign in error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form action={handleSubmit} formTitle="Sign in">
        <FormField
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <Button
              type="button"
              onClick={signInWithGoogle}
              variant="secondary"
              disabled={isLoading}
            >
              Continue with Google
            </Button>
            <p className="text-sm text-center mt-5 border-t pt-2">Don&apos;t have an account?</p>
            <Link href="/auth/signup">
              <Button type="button" disabled={isLoading}>
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </Form>
    </>
  );
}
