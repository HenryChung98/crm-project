"use client";
import { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCheckPlan } from "@/shared-hooks/useCheckPlan";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface SubscriptionContextType {
  plan: "free" | "active" | "premium" | undefined;
  status: "free" | "active" | "inactive" | "expired" | "canceled" | undefined;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | undefined;
  endsAt: string | undefined;
  planLoading: boolean;
}

// create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const router = useRouter();

  // get current organization id from params
  const currentOrganizationId = (params.orgId as string) ?? "";

  // get plan from subscriptions
  const { data: plan, isLoading: planLoading } = useCheckPlan(currentOrganizationId);

  const shouldRedirect =
    plan?.subscription.payment_status !== "paid" || plan?.subscription.status !== "active";
    
  useEffect(() => {
    if (planLoading || !plan) return;

    if (plan.subscription.status === "free") return;

    if (shouldRedirect) {
      router.push(`/subscription`);
    }

    if (plan.subscription.ends_at && new Date(plan.subscription.ends_at) < new Date()) {
      console.log("plan is expired. payment is required");
    }
  }, [planLoading, plan?.subscription.status, plan?.subscription.payment_status, router]);

  const value = useMemo(
    () => ({
      plan: plan?.plans.name,
      status: plan?.subscription.status,
      paymentStatus: plan?.subscription.payment_status,
      endsAt: plan?.subscription.ends_at,
      planLoading,
    }),
    [plan, planLoading]
  );
  if (shouldRedirect) {
    return <LoadingSpinner />;
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error("useSubscription must be used within an AuthProvider");
  }

  return context;
};
