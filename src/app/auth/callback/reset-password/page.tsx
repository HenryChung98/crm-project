"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isValidPassword } from "@/shared-utils/validations";

// icons
import { BiShow, BiHide } from "react-icons/bi";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showError } from "@/components/feedback";

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (!isValidPassword(value)) {
        error = "Password must be at least 8 characters long and contain letters and numbers";
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== formData.password) {
        error = "Passwords do not match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    // Re-validate confirmPassword when password changes
    if (name === "password" && formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const confirmPasswords = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }

    setIsLoading(true);
    try {
      const { password, confirmPassword } = formData;
      
      if (password !== confirmPassword) {
        showError("Passwords do not match");
        return;
      }
      
      if (!isValidPassword(password)) {
        showError("Password must be at least 8 characters long and contain letters and numbers.");
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

  const hasErrors = Object.values(errors).some((error) => error !== "");
  const isFormValid = formData.password && formData.confirmPassword;

  return (
    <>
      <Form onSubmit={confirmPasswords} formTitle="Enter your new password">
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        <FormField
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
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
            <Button type="submit" disabled={isLoading || hasErrors || !isFormValid}>
              reset
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
}