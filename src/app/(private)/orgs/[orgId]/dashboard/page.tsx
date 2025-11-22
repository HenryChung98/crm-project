"use client";

// custom hooks
import { useOrganization } from "@/contexts/OrganizationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useDashboardStats } from "./_internal/useDashboardStats";

// ui
import { Button } from "@/components/ui/Button";
import { StatCard } from "./_internal/StatCard";
import { MonthlyStatCard } from "./_internal/MonthlyStatCard";
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
          <MonthlyStatCard
            title="Contact Sources"
            data={data.monthlyStats}
            dataKeys={["contactFromInstagram", "contactFromFacebook", "contactFromMember"]}
            allowedCharts={["bar", "line"]}
            labelMap={{
              contactFromInstagram: "Instagram",
              contactFromFacebook: "Facebook",
              contactFromMember: "Member Referral",
            }}
          />
          <div>
            <div>contact total: {data.periodStats["total"].contactTotal}</div>
            <div>contact insta: {data.periodStats["total"].contactFromInstagram}</div>
            <div>contact fb: {data.periodStats["total"].contactFromFacebook}</div>
            <div>contact m: {data.periodStats["total"].contactFromMember}</div>
            <div>visit total: {data.periodStats["total"].visitTotal}</div>
          </div>
          <StatCard
            title="Contacts"
            data={data.periodStats}
            dataKeys={["lead", "customer"]}
            allowedCharts={["bar", "pie"]}
            labelMap={{
              lead: "Leads",
              customer: "Customers",
            }}
          />

          <MonthlyStatCard
            title="Visits"
            data={data.monthlyStats}
            dataKeys={["visitFromInstagram", "visitFromFacebook"]}
            allowedCharts={["bar", "line"]}
            labelMap={{
              visitFromInstagram: "Instagram",
              visitFromFacebook: "Facebook",
            }}
          />

          <MonthlyStatCard
            title="Monthly"
            data={data.monthlyStats}
            dataKeys={["contactTotal", "visitTotal"]}
            allowedCharts={["bar", "line"]}
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
