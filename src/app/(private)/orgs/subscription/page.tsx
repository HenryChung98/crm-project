"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { selectPlan } from "./utils/plan-selection";

// types
import { PlanName } from "@/types/database/plan";

// customer hooks
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";

// ui
import { Button } from "@/components/ui/Button";
import { showError, showSuccess } from "@/components/feedback";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SubscriptionPage() {
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { ownOrganization, orgMemberLoading } = useOrganization();

  if (orgMemberLoading) {
    return <LoadingSpinner />;
  }

  const handlePlanSelect = async (planName: PlanName) => {
    if (!user || !supabase) {
      router.replace("/auth/signin");
      return;
    }

    // if free, do not redirect to /checkout
    if (planName === "free") {
      setLoading(true);
      try {
        const result = await selectPlan(user.id, planName);
        if (result.success) {
          await queryClient.invalidateQueries({
            queryKey: ["subscription"],
          });
          showSuccess("Free plan activated successfully");
          window.location.href = ownOrganization
            ? `/orgs/${ownOrganization}/dashboard`
            : "/orgs/create-organization";
        } else {
          showError(result.error || "Failed to select plan");
        }
      } catch (error) {
        showError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
      return;
    }

    const params = new URLSearchParams({
      plan: planName,
      userId: user.id,
    });
    router.push(`/orgs/subscription/checkout?${params.toString()}`);
  };

  const planDetails = {
    free: { price: "Free", features: ["Basic features", "Limited storage"] },
    basic: {
      price: "$9.99/month",
      features: ["All basic features", "More storage", "Email support"],
    },
    premium: {
      price: "$19.99/month",
      features: ["All features", "Unlimited storage", "Priority support"],
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-text-secondary">Select a plan that works best for you</p>
        </div>

        <div className="space-y-4">
          {(Object.keys(planDetails) as PlanName[]).map((planName) => {
            const plan = planDetails[planName];
            return (
              <div key={planName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg capitalize">{planName}</h3>
                  <span className="font-bold text-xl">{plan.price}</span>
                </div>
                <ul className="text-sm text-text-secondary mb-4 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePlanSelect(planName)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : planName === "free" ? "Get Started" : "Select Plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
