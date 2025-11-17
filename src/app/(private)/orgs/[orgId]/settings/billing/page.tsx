"use client";
import Link from "next/link";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CRMHeader } from "@/components/CRMHeader";

export default function BillingPage() {
  const { planData, planLoading } = useSubscription();

  if (planLoading) return <LoadingSpinner />;

  if (planData) {
    return (
      <>
        <CRMHeader title="Billing" actions={<></>} />
        <div className="p-6 mb-5 rounded-lg shadow-sm border border-border text-center">
          <h3 className="text-lg text-text-secondary">
            Organization Plan: <span className="text-green-500">{planData.plan.name}</span>
            <br />
            Expires:{" "}
            <span className="text-green-500">
              {new Date(planData.ends_at).toLocaleDateString()}
            </span>
          </h3>
        </div>
        <Link href={`/orgs/subscription`}>subscription</Link>
      </>
    );
  }
}
