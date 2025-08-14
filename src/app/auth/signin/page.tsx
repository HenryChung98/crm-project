"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "./action";
import { signInWithGoogle } from "./signInWIthGoogle";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
          label="Email"
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={() => setShowPassword(!showPassword)}>show passwords</Button>
        <div className="space-y-2">
          <div>
            <Button type="submit">Sign in</Button>
            <Button type="button" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
          </div>
          <Button type="submit">
            <Link href="/auth/signup">sign up</Link>
          </Button>
          <Button>
            <Link href="/auth/signin/reset-password">reset password?</Link>
          </Button>
        </div>
      </Form>
    </>
  );
}
