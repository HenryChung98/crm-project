"use client";
import { createClient } from "@/utils/supabase/client";
import { useSupabase } from "@/hooks/useSupabase";
import { useEffect } from "react";

export default function Home() {
  const { user } = useSupabase();

  const supabase = createClient();
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log(session);
      }
    };

    getSession();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {user ? (
          <span className="text-green-700">{user.email}</span>
        ) : (
          <span className="text-gray-500">Guest</span>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
