"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/");
    } else {
      // if not logged in, redirect to signin
      router.replace("/auth/signin");
    }
  }, [router]);

  return <p>Loading...</p>;
}
