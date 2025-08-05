"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/useSupabase";

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useSupabase();

  useEffect(() => {
    if (user) {
      router.replace("/");
    } else {
      // if not logged in, redirect to signin
      router.replace("/signin");
    }
  }, [router]);

  return <p>Loading...</p>;
}
