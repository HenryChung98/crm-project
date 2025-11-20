"use client";

// custom hooks
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDashboardStats } from "./_internal/useDashboardStats";

// import { useMonthlyStats } from "./_internal/dashboard-monthly-stats";
import { TimeSeriesCard } from "./_internal/TimeSeriesCard";

// ui
import { Button } from "@/components/ui/Button";
import { StatCard } from "./_internal/StatCard";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { CRMHeader } from "@/components/pages/CRMHeader";

export default function DashboardPage() {
  const { currentOrganizationId, member } = useOrganization();
  const { planData } = useSubscription();
  const { data, isLoading, refetch, isFetching } = useDashboardStats(currentOrganizationId);
  // const { data: monthlyData } = useMonthlyStats(currentOrganizationId);

  if (isLoading) {
    return <FetchingSpinner />;
  }

  if (member && planData && data) {
    return (
      <>
        <CRMHeader
          title="Dashboard"
          actions={
            <Button variant="secondary" onClick={refetch} disabled={isFetching}>
              {isFetching ? "Refreshing.." : "Refresh"}
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard
            title="Contacts"
            data={data.periodStats}
            dataKeys={["lead", "customer"]}
            allowedCharts={["bar", "pie", "line"]}
            labelMap={{
              lead: "Leads",
              customer: "Customers",
            }}
          />

          <StatCard
            title="Contact Sources"
            data={data.periodStats}
            dataKeys={["contactFromInstagram", "contactFromFacebook", "contactFromMember"]}
            allowedCharts={["bar", "pie"]}
            labelMap={{
              contactFromInstagram: "Instagram",
              contactFromFacebook: "Facebook",
              contactFromMember: "Member Referral",
            }}
          />

          <StatCard
            title="Visits"
            data={data.periodStats}
            dataKeys={["visitFromInstagram", "visitFromFacebook"]}
            allowedCharts={["bar", "line"]}
            labelMap={{
              visitFromInstagram: "Instagram",
              visitFromFacebook: "Facebook",
            }}
          />

          <TimeSeriesCard
            title="Monthly"
            data={data.monthlyStats}
            dataKeys={["contactTotal", "visitTotal"]}
            labelMap={{
              contactTotal: "Contacts",
              visitTotal: "Visits",
            }}
          />
        </div>
      </>
    );
  }
}
