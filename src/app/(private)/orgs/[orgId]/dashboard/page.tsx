"use client";
import Link from "next/link";

// custom hooks
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDashboardStats } from "./_internal/useDashboardStats";

// ui
import { Button } from "@/components/ui/Button";
import { StatCard } from "./_internal/StatCard";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { currentOrganizationId, member } = useOrganization();
  const { planData } = useSubscription();
  const { data, isLoading, refetch, isFetching } = useDashboardStats(currentOrganizationId);

  if (isLoading) {
    return <FetchingSpinner />;
  }

  if (member && planData && data) {
    return (
      <>
        <Link href={`/orgs/subscription`}>sub</Link>
        <div className="mb-5">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <div className="p-6 rounded-lg shadow-sm border border-border text-center">
            <h3 className="text-lg text-text-secondary">
              Organization Plan: <span className="text-green-500">{planData.plan.name}</span>
              <br />
              Expires:{" "}
              <span className="text-green-500">
                {new Date(planData.ends_at).toLocaleDateString()}
              </span>
            </h3>
          </div>
        </div>
        <Button variant="secondary" onClick={refetch} disabled={isFetching} className="mb-5">
          {isFetching ? "Fetching.." : "Refetch"}
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            title="Total Website Visits"
            value={data.visitTotal}
            subValues={{
              instagram: data.visitFromInstagram,
              facebook: data.visitFromFacebook,
              etc: data.visitTotal - data.visitFromFacebook - data.visitFromInstagram,
            }}
            allowedCharts={["bar", "pie"]}
          />
          <StatCard
            title="Form Submission Total"
            value={data.customerFromInstagram + data.customerFromFacebook}
            subValues={{
              instagram: data.customerFromInstagram,
              facebook: data.customerFromFacebook,
              test: 30,
              test2: 100,
              test3: 30,
              test4: 10,
              test5: 3,
              test6: 223,
              test7: 22,
              test8: 12,
            }}
            allowedCharts={["bar", "pie"]}
          />
          <StatCard
            title="Contacts most recently created by source"
            value={5}
            allowedCharts={["bar", "pie", "line"]}
          />
          <StatCard
            title="Marketing email totals by open rate"
            value={5}
            allowedCharts={["bar", "pie"]}
          />
        </div>
        {/* <div className="space-y-8">
            {member?.role === "owner" && (
              <div className="flex justify-end">
                <Button variant="primary">
                  <Link href={`dashboard/invite-member`}>invite</Link>
                </Button>
              </div>
            )}
          </div> */}
      </>
    );
  }
}
