"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { selectPlan, PlanName } from "./action";

export default function PricingPage() {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePlanSelect = async (planName: PlanName) => {
    // 인증 체크
    if (!user || !supabase) {
      router.replace("auth/signin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await selectPlan(supabase, user.id, planName);
      
      if (result.success) {
        router.replace("/dashboard");
      } else {
        setError(result.error || "Failed to select plan");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="m-auto flex flex-col items-center gap-5">
        <div>pricing page</div>
        
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <Button 
          onClick={() => handlePlanSelect("free")} 
          disabled={loading}
        >
          {loading ? "Processing..." : "Free"}
        </Button>
        
        <Button 
          onClick={() => handlePlanSelect("basic")} 
          disabled={loading}
        >
          {loading ? "Processing..." : "Basic"}
        </Button>
        
        <Button 
          onClick={() => handlePlanSelect("premium")} 
          disabled={loading}
        >
          {loading ? "Processing..." : "Premium"}
        </Button>
      </div>
    </>
  );
}