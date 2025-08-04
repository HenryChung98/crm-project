"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // if logged in, redirect to home
        router.replace("/");
      } else {
        // if not logged in, redirect to signin
        router.replace("/signin");
      }
    };
    checkSession();
  }, [router]);

  return <p>Loading...</p>;
}