"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";

export default function ResetPasswordPage() {
  const { supabase } = useSupabase();

  const router = useRouter();

  const [data, setData] = useState<{
    password: string;
    confirmPassword: string;
  }>({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const confirmPasswords = async () => {
    const { password, confirmPassword } = data;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const { data: resetData, error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (resetData) {
      router.push("/signin");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div>
        <label htmlFor="password">Enter your new password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={data?.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm your new password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={data?.confirmPassword}
          onChange={handleChange}
        />
      </div>
      <button onClick={() => setShowPassword(!showPassword)}>show passwords</button>
      <br />
      <button onClick={confirmPasswords}>reset</button>
    </>
  );
}
