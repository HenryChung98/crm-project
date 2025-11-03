"use client";

import { useState, useEffect } from "react";
import { signUp } from "./action";
import { BiShow, BiHide } from "react-icons/bi";
import { useSearchParams } from "next/navigation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const orgId = searchParams.get("org_id");
    const orgName = searchParams.get("org_name");
    if (orgId) {
      setFormData((prev) => ({
        ...prev,
        orgId: orgId,
      }));
    }
    if (orgName) {
      setFormData((prev) => ({
        ...prev,
        orgName: orgName,
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    const orgId = searchParams.get("org_id");
    const orgName = searchParams.get("org_name");
    document.cookie = `pending_org_id=${orgId}; path=/; max-age=3600`;
    document.cookie = `pending_org_name=${orgName}; path=/; max-age=3600`;

    const res = await signUp(formData);

    if (res?.error) {
      showError(res.error);
    } else {
      showSuccess("Sign up successful");
    }
  };

  return (
    <>
      <Form action={handleSubmit} formTitle="Sign up">
        <FormField
          name="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <FormField
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <FormField
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormField
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <FormField
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
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
          <Button type="submit"> Sign Up</Button>
        </div>
      </Form>
    </>
  );
}
