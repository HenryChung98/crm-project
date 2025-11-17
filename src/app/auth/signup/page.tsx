"use client";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "./action";
import { BiShow, BiHide } from "react-icons/bi";
import { isValidEmail, isValidPassword } from "@/shared-utils/validations";

import { signInWithGoogle } from "../signin/signInWIthGoogle";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "firstName" || name === "lastName") {
      if (!value) {
        error = "SILENT_ERROR";
      }
    }

    if (name === "email") {
      if (!value) {
        error = "SILENT_ERROR";
      } else if (!isValidEmail(value)) {
        error = "Please enter a valid email address";
      }
    }

    if (name === "password") {
      if (!value) {
        error = "SILENT_ERROR";
      } else if (!isValidPassword(value)) {
        error = "Password must be at least 8 characters long and contain letters and numbers";
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        error = "SILENT_ERROR";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = new FormData();
      submissionData.append("firstName", formData.firstName);
      submissionData.append("lastName", formData.lastName);
      submissionData.append("email", formData.email);
      submissionData.append("password", formData.password);
      submissionData.append("confirmPassword", formData.confirmPassword);

      const res = await signUp(submissionData);

      if (res?.error) {
        showError(res.error);
      } else {
        showSuccess("Sign up successful");
      }
    } catch (error) {
      showError(`Sign in error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some((error) => error !== "" && error !== "SILENT_ERROR");

  return (
    <>
      <Form onSubmit={handleSubmit} formTitle="Sign up">
        <FormField
          name="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />
        <FormField
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
        <FormField
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <FormField
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        <FormField
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm px-2 py-1"
        >
          {showPassword ? <BiShow size={20} /> : <BiHide size={20} />}
        </button>
        <div className="flex flex-col gap-5">
          <Button type="submit" disabled={isLoading || hasErrors}>
            Sign Up
          </Button>
          <Button type="button" onClick={signInWithGoogle} variant="secondary" disabled={isLoading}>
            Continue with Google
          </Button>
          <p className="text-sm text-center mt-5 border-t pt-2">Already have an account?</p>
          <Link href="/auth/signin">
            <Button type="button" disabled={isLoading}>
              Sign in
            </Button>
          </Link>
        </div>
      </Form>
    </>
  );
}
