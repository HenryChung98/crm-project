"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

// type
import { EMPTY_ARRAY } from "@/types/customData";

// hook
import { useOrganizationInvitationsByEmail } from "@/hooks/tanstack/useOrganizationInvitations";
import { useCustomerLogs } from "@/hooks/tanstack/useCustomerLogs";
import { useDashboardStats } from "@/hooks/tanstack/useDashboardStats";
import { usePlanByUser, usePlanByOrg } from "@/hooks/tanstack/usePlan";

// ui
import JoinOrganizationButton from "@/components/JoinOrganizationButton";
import { Button } from "@/components/ui/Button";
import { SubscribedPlan } from "@/types/plan";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type OrgInvitation = {
  id: string;
  created_at: string;
  email: string;
  organization_id: string;
  organizations: {
    name: string;
  } | null;
};

type CustomerLog = {
  id: string;
  action: string;
  performed_at: string;
  performed_by: string;
  organization_members?: {
    user_email: string;
  };
};

const StatCard = React.memo(({ title, value }: { title: string; value?: number }) => {
  return (
    <div className="p-4 border rounded shadow rounded-lg text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value ?? 0}</p>
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
    useOrganizationInvitationsByEmail<OrgInvitation>();

  // customer logs
  const {
    data: customerLogs = EMPTY_ARRAY,
    isLoading: customerLogLoading,
    error: customerLogError,
  } = useCustomerLogs<CustomerLog>(
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
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {process.env.NODE_ENV === "development" && (
        <Link href={`/testPage?org=${currentOrgId}`} className="border">
          test page
        </Link>
      )}
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* 사용자 플랜 정보 */}
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          You are using: <span className="text-blue-600">{plan?.plans.name}</span>
        </h2>
        {currentOrgId && orgPlan && (
          <h3 className="text-xl text-gray-700">
            Organization Plan: <span className="text-green-600">{orgPlan.plans.name}</span>
          </h3>
        )}
      </div>

      <div className="w-full max-w-4xl p-8 rounded-lg shadow-md">
        {currentOrgId ? (
          <div>
            {/* 조직 대시보드 콘텐츠 */}
            <div className="flex gap-2 items-center justify-between mb-6">
              <Button variant="primary">
                <Link href={`/dashboard/invite-member?org=${currentOrgId}`}>Invite Member</Link>
              </Button>
            </div>

            {/* 통계 카드들 */}
            <div className="flex items-center gap-5 mb-6">
              <StatCard title="Total Customers" value={data?.total} />
              <StatCard title="New Customers (30 days)" value={data?.new} />
              <StatCard title="Activated Customers" value={data?.active} />
            </div>

            {/* 고객 로그 */}
            <div className="border rounded p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Recent Activity Logs</h3>
              {customerLogLoading ? (
                <div className="text-gray-500">Loading logs...</div>
              ) : customerLogs.length > 0 ? (
                <div className="space-y-2">
                  {customerLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Action: {log?.action}</div>
                      <div className="text-xs text-gray-600">
                        By: {log?.organization_members?.user_email || "Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No recent activity</div>
              )}
              {customerLogError && (
                <div className="text-red-500 text-sm mt-2">
                  Error loading logs: {customerLogError.message}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Organization Selected</h2>
              <p className="text-gray-600 mb-4">
                Please select an organization to view the dashboard or join an organization.
              </p>
            </div>
          </div>
        )}

        {/* 초대 목록 */}
        {isInvitationLoading && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <div className="text-blue-700">Loading invitations...</div>
          </div>
        )}

        {hasInvitations && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Organization Invitations</h3>
            <div className="space-y-2">
              {orgInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-green-50 border border-green-200 rounded p-3"
                >
                  <div className="text-green-800 font-medium mb-2">
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
