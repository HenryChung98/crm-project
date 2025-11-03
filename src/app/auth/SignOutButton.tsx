"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export const SignOutButton = () => {
  const { supabase } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("signOut exception:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
};
