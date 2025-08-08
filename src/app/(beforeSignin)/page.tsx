"use client";
// import { createClient } from "@/utils/supabase/client";
// import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  // const supabase = createClient();
  // useEffect(() => {
  //   const getSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     if (session?.user) {
  //       console.log(session);
  //     }
  //   };

  //   getSession();
  // }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {loading ? (
          <span className="text-gray-400">Checking auth...</span>
        ) : user ? (
          <span className="text-green-700">{user.email}</span>
        ) : (
          <span className="text-gray-500">Guest</span>
        )}
        <Link href={user ? "/dashboard" : "/auth/signin"} className="pr-5">
          dashboard / signin
        </Link>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
        <div>dummy</div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
