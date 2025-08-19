"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // if (user) {
    // router.replace("/");
    // } else {
    router.replace("/auth/signin");
    // }
  }, [router]);

  return <p>Loading...</p>;
}
