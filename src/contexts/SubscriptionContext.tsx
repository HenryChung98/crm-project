"use client";
import { createContext, useContext, useMemo, useEffect } from "react";
import { SubscribedPlan } from "@/types/database/plan";
import { useOrganization } from "./OrganizationContext";

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
  // get plan from subscriptions==========================================
  const { member, orgMemberLoading: planLoading } = useOrganization();
  const plan = member?.organizations?.subscription;

  // ========================= get subscription issue detail =========================
  const getSubscriptionIssues = (): SubscriptionIssue[] => {
    if (!plan || plan.status === "free") return [];

    const issues: SubscriptionIssue[] = [];
    const { payment_status, status, ends_at } = plan;

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

  useEffect(() => {
    if (planLoading) return;
  }, [planLoading]);
  const value = useMemo(
    () => ({
      planData: plan,
      planLoading,
    }),
    [plan, planLoading]
  );

  const issues = getSubscriptionIssues();

  // Ensure that the value provided matches the SubscriptionContextType,
  // especially regarding the 'planData' property.
  // If 'plan' lacks required fields (such as 'subscription'), adapt accordingly.
  return (
    <SubscriptionContext.Provider value={value as SubscriptionContextType}>
      {issues.length > 0 && <IssueModal issues={issues} />}
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 *`planData`: plan data regards current organization id

 *`planLoading`: Loading state for organization membership data.

 */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error("useSubscription must be used within an AuthProvider");
  }

  return context;
};
