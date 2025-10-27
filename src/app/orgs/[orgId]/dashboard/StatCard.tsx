import React from "react";
import { DashboardStatsType } from "./hook/dashboard-stats";
export const STAT_GROUPS = [
  {
    title: "Total Customer",
    stats: [{ key: "totalCustomerNum" as const, label: "Total Customers" }],
  },
  {
    title: "Customer by Source",
    stats: [
      { key: "instagramCustomerNum" as const, label: "Instagram" },
      { key: "facebookCustomerNum" as const, label: "Facebook" },
      { key: "memberCustomerNum" as const, label: "member" },
    ],
  },

  {
    title: "Customer Status",
    stats: [
      { key: "newCustomerNum" as const, label: "New Customers (Last 30 days)" },
      { key: "leadNum" as const, label: "Lead Customers" },
      { key: "customerNum" as const, label: "Activated Customers" },
    ],
  },
  {
    title: "Website Metrics",
    stats: [
      { key: "visitFromInstagramNum" as const, label: "Web Visited From Instagarm" },
      { key: "visitFromFacebookNum" as const, label: "Web Visited From Facebook" },
    ],
  },
] as const;

interface StatCardProps {
  title: string;
  value?: number;
}

interface StatGroupProps {
  title: string;
  children: React.ReactNode;
}

interface DashboardStatsProps {
  stats?: DashboardStatsType;
}

export const StatCard = React.memo(({ title, value }: StatCardProps) => (
  <div className="p-6 border border-border rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
    <h3 className="text-sm font-medium uppercase tracking-wide">{title}</h3>
    <p className="mt-3 text-3xl font-bold">{value ?? 0}</p>
  </div>
));

StatCard.displayName = "StatCard";

export const StatGroup = ({ title, children }: StatGroupProps) => (
  <div className="border border-border rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

export const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <div className="space-y-6">
    {STAT_GROUPS.map((group) => (
      <StatGroup key={group.title} title={group.title}>
        {group.stats.map((stat) => (
          <StatCard key={stat.key} title={stat.label} value={stats?.[stat.key]} />
        ))}
      </StatGroup>
    ))}
  </div>
);
