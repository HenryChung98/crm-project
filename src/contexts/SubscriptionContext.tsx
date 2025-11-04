"use client";
import { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCheckPlan } from "@/shared-hooks/useCheckPlan";

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

  // get current organization id from params
  const currentOrganizationId = (params.orgId as string) ?? "";

  // get plan from subscriptions
  const { data: plan, isLoading: planLoading } = useCheckPlan(currentOrganizationId);

  useEffect(() => {
    if (planLoading) return;
  }, [planLoading]);

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

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error("useSubscription must be used within an AuthProvider");
  }

  return context;
};
