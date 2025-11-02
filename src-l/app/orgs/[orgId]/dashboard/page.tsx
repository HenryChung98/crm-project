"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// type
import { EMPTY_ARRAY } from "../../../../types/customData";

// hook
import { useActivityLogs } from "../../../../hooks/tanstack/useActivityLogs";
import { usePlanByOrg } from "../../../../hooks/tanstack/usePlan";
import { useOrgAuth } from "../../../../hooks/tanstack/useOrgAuth";
import { useDashboardStats } from "./hook/useDashboardStats";

// ui
import { Button } from "../../../../components/ui/Button";
import { LoadingSpinner } from "../../../../components/ui/LoadingSpinner";
import { DashboardStats } from "./StatCard";

export default function DashboardPage() {
  const params = useParams();
  const currentOrgId = (params.orgId as string) ?? "";

  const { hasRole } = useOrgAuth(currentOrgId);
  const { data: dashboardStats, isLoading: isDashboardStatLoading } =
    useDashboardStats(currentOrgId);

  const { data: activityLogs = EMPTY_ARRAY, isLoading: activityLogLoading } = useActivityLogs(
    currentOrgId || ""
  );

  const { data: orgPlan, isLoading: orgPlanLoading } = usePlanByOrg(currentOrgId);

  const isEssentialLoading = currentOrgId && orgPlanLoading && isDashboardStatLoading;

  if (isEssentialLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          {currentOrgId && orgPlan && (
            <div className="p-6 rounded-lg shadow-sm border border-border text-center">
              <h3 className="text-lg text-text-secondary">
                Organization Plan: <span className="text-green-600">{orgPlan.plans.name}</span>
                <br />
                Expires:{" "}
                <span className="text-green-600">
                  {new Date(orgPlan.subscription.ends_at).toLocaleDateString()}
                </span>
              </h3>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {hasRole("owner") && (
            <div className="flex justify-end">
              <Button variant="primary">
                <Link href={`/orgs/${currentOrgId}/dashboard/invite-member`}>Invite Member</Link>
              </Button>
            </div>
          )}

          <div className="min-h-screen p-6">
            <DashboardStats stats={dashboardStats || undefined} />
          </div>

          {/* Activity Logs */}
          <div className="border border-border rounded-lg shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Recent Activity Logs</h3>
            </div>
            <div className="p-6">
              {activityLogLoading ? (
                <div className="flex items-center justify-center py-8">Loading logs...</div>
              ) : activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium">Action: {log?.action}</div>
                      <div className="text-xs mt-1 text-text-secondary">
                        By: {log?.organization_members?.user_email || "Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
