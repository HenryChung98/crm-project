"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// icons
import { BiShow, BiHide } from "react-icons/bi";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showError } from "@/utils/feedback";

export default function ResetPasswordPage() {
  const { supabase } = useAuth();

  const router = useRouter();

  const [formData, setFormData] = useState<{
    password: string;
    confirmPassword: string;
  }>({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const confirmPasswords = async () => {
    setIsLoading(true);
    try {
      const { password, confirmPassword } = formData;
      if (password !== confirmPassword) {
        showError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      const { data: resetData } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (resetData) {
        router.replace("/auth/signin");
      }
    } catch (err) {
      showError(`Reset password error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) {
      setError(null);
    }
  };
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Form action={confirmPasswords} formTitle="Enter your new password">
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
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
          </div>

          <div className="flex flex-col gap-5">
            <Button type="submit" disabled={isLoading}>
              reset
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
}
