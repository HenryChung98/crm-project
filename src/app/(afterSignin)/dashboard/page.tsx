"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

// type
import { EMPTY_ARRAY } from "@/types/customData";
import { OrganizationInvitations } from "@/types/database/organizations";
import { CustomerLogs } from "@/types/database/customers";

// hook
import { useOrganizationInvitationsByEmail } from "@/hooks/tanstack/useOrganizationInvitations";
import { useCustomerLogs } from "@/hooks/tanstack/useCustomerLogs";
import { useDashboardStats } from "@/hooks/tanstack/useDashboardStats";
import { usePlanByUser, usePlanByOrg } from "@/hooks/tanstack/usePlan";

// ui
import JoinOrganizationButton from "@/components/JoinOrganizationButton";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const StatCard = React.memo(({ title, value }: { title: string; value?: number }) => {
  return (
    <div className="p-6 border border-border rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="mt-3 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
});

StatCard.displayName = "StatCard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") ?? "";

  // get selected organization
  const { data, isLoading } = useDashboardStats(currentOrgId);

  // organization invitation
  const { data: orgInvitations = EMPTY_ARRAY, isLoading: isInvitationLoading } =
    useOrganizationInvitationsByEmail<OrganizationInvitations>();

  // customer logs
  const {
    data: customerLogs = EMPTY_ARRAY,
    isLoading: customerLogLoading,
    error: customerLogError,
  } = useCustomerLogs<CustomerLogs>(
    currentOrgId || "",
    `id, action, organization_members:performed_by(user_email)`
  );

  // get current user's plan
  const { data: plan, isLoading: planLoading, error: planError } = usePlanByUser();

  // get current organization's plan - currentOrgId가 있을 때만 실행
  const {
    data: orgPlan,
    isLoading: orgPlanLoading,
    error: orgPlanError,
  } = usePlanByOrg(currentOrgId);

  const hasInvitations = useMemo(() => orgInvitations.length > 0, [orgInvitations]);

  const isEssentialLoading = planLoading || (currentOrgId && (isLoading || orgPlanLoading));

  if (isEssentialLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {process.env.NODE_ENV === "development" && (
          <Link href={`/testPage?org=${currentOrgId}`} className="border">
            test page
          </Link>
        )}

        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

          {/* 플랜 정보 */}
          <div className="p-6 rounded-lg shadow-sm border border-border">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Your Plan: <span className="text-blue-600">{plan?.plans.name}</span>
              </h2>
              {currentOrgId && orgPlan && (
                <h3 className="text-lg text-text-secondary">
                  Organization Plan: <span className="text-green-600">{orgPlan.plans.name}</span>
                </h3>
              )}
            </div>
          </div>
        </div>

        {currentOrgId ? (
          <div className="space-y-8">
            {/* 액션 버튼 */}
            <div className="flex justify-end">
              <Button variant="primary">
                <Link href={`/dashboard/invite-member?org=${currentOrgId}`}>Invite Member</Link>
              </Button>
            </div>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Customers" value={data?.total} />
              <StatCard title="New Customers (30 days)" value={data?.new} />
              <StatCard title="Activated Customers" value={data?.active} />
            </div>

            {/* 고객 로그 */}
            <div className="border border-border rounded-lg shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold">Recent Activity Logs</h3>
              </div>
              <div className="p-6">
                {customerLogLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="">Loading logs...</div>
                  </div>
                ) : customerLogs.length > 0 ? (
                  <div className="space-y-4">
                    {customerLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">
                              Action: {log?.action}
                            </div>
                            <div className="text-xs mt-1 text-text-secondary">
                              By: {log?.organization_members?.user_email || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No recent activity</div>
                )}
                {customerLogError && (
                  <div className="mt-4 p-3 border border-red-200 rounded text-red-600 text-sm">
                    Error loading logs: {customerLogError.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg shadow-sm border p-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Organization Selected
              </h2>
              <p className="text-gray-600 text-lg">
                Please select an organization to view the dashboard or join an organization.
              </p>
            </div>
          </div>
        )}

        {/* 초대 목록 */}
        {isInvitationLoading && (
          <div className="mt-8 border border-blue-200 rounded-lg p-6">
            <div className="text-blue-700">Loading invitations...</div>
          </div>
        )}

        {hasInvitations && (
          <div className="mt-8 rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Organization Invitations</h3>
            </div>
            <div className="p-6 space-y-4">
              {orgInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="text-green-800 font-medium mb-3">
                    Invited to: {invitation.organizations?.name || "Unknown Organization"}
                  </div>
                  <JoinOrganizationButton
                    inviteId={invitation.organization_id}
                    orgName={invitation.organizations?.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
