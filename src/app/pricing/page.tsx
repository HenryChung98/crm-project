"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { selectPlan } from "./plan-selection";
import { PlanName } from "@/types/plan";

// ui
import { showError, showSuccess } from "@/utils/feedback";

export default function PricingPage() {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlanSelect = async (planName: PlanName) => {
    // 인증 체크
    if (!user || !supabase) {
      router.replace("auth/signin");
      return;
    }

    setLoading(true);

    try {
      const result = await selectPlan(supabase, user.id, planName);

      if (result.success) {
        router.replace("/dashboard");
        showSuccess("success");
      } else {
        showError(result.error || "Failed to select plan");
      }
    } catch (error) {
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="m-auto flex flex-col items-center gap-5">
        <div>pricing page</div>

        <Button onClick={() => handlePlanSelect("free")} disabled={loading}>
          {loading ? "Processing..." : "Free"}
        </Button>

        <Button onClick={() => handlePlanSelect("basic")} disabled={loading}>
          {loading ? "Processing..." : "Basic"}
        </Button>

        <Button onClick={() => handlePlanSelect("premium")} disabled={loading}>
          {loading ? "Processing..." : "Premium"}
        </Button>
      </div>
    </>
  );
}
