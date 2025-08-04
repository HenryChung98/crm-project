"use client";
import Image from "next/image";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
export default function Home() {
  const { user, loading, isAuthenticated } = useSupabase();

       useEffect(() => {
      const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();
        console.log("✅ Supabase Session:", data?.session);
        // console.log("🧠 Access Token:", data?.session?.access_token);
        // console.log("🧠 User:", data?.session?.user);
        // console.log("🍪 document.cookie (available cookies):", document.cookie);
      };
  
      checkSession();
    }, []);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        hello world {user?.email || "guest"}!
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
