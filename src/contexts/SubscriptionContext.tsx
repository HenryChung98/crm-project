"use client";
import { createContext, useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { useCheckPlan } from "@/shared-hooks/useCheckPlan";
import { SubscribedPlan } from "@/types/database/plan";

interface SubscriptionContextType {
  planData: SubscribedPlan | null | undefined;
  planLoading: boolean;
}

interface SubscriptionIssue {
  type: "payment" | "subscription" | "expired";
  status: string;
  message: string;
}

const IssueModal = ({ issues }: { issues: SubscriptionIssue[] }) => {
  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="max-w-md w-full border rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Issues</h2>
        <ul className="space-y-2 mb-6">
          {issues.map((issue, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium capitalize">{issue.type}:</span> {issue.message}
            </li>
          ))}
        </ul>
        <button
          onClick={() => (window.location.href = "/orgs/subscription")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go to Subscription Page or contact
        </button>
      </div>
    </div>
  );
};

// create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();

  // get current organization id from params
  const currentOrganizationId = (params.orgId as string) ?? "";

  // get plan from subscriptions
  const { data: plan, isLoading: planLoading } = useCheckPlan(currentOrganizationId);

  // ========================= get subscription issue detail =========================
  const getSubscriptionIssues = (): SubscriptionIssue[] => {
    if (!plan || plan.subscription.status === "free") return [];

    const issues: SubscriptionIssue[] = [];
    const { payment_status, status, ends_at } = plan.subscription;

    if (payment_status !== "paid") {
      issues.push({
        type: "payment",
        status: payment_status,
        message: `Payment is ${payment_status}`,
      });
    }

    if (status !== "active") {
      issues.push({
        type: "subscription",
        status: status,
        message: `Subscription is ${status}`,
      });
    }

    if (ends_at && new Date(ends_at) < new Date()) {
      issues.push({
        type: "expired",
        status: "expired",
        message: `Subscription expired at ${new Date(ends_at).toLocaleDateString()}`,
      });
    }

    return issues;
  };
  // =================================================================================

  const value = useMemo(
    () => ({
      planData: plan,
      planLoading,
    }),
    [plan, planLoading]
  );

  const issues = getSubscriptionIssues();

  return (
    <SubscriptionContext.Provider value={value}>
      {issues.length > 0 && <IssueModal issues={issues} />}
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error("useSubscription must be used within an AuthProvider");
  }

  return context;
};
