"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import JoinOrgButton from "@/app/components/JoinOrgButton";
import { useOrganizationInvitationsByEmail } from "@/hooks/tanstack/useOrganizationInvitations";
import { useCustomerLogs } from "@/hooks/tanstack/useCustomerLogs";
import { useDashboardStats } from "@/hooks/tanstack/useDashboardStats";

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

function StatCard({ title, value }: { title: string; value?: number }) {
  return (
    <div className="p-4 border rounded shadow rounded-lg text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org");

  const { data, isLoading } = useDashboardStats(currentOrgId!);

  // organization invitation
  const {
    data: orgInvitations = [],
    isLoading: isInvitationLoading,
    error: invitationError,
  } = useOrganizationInvitationsByEmail<OrgInvitation>(`
    id, created_at, email, organization_id,
    organizations:organization_id(name)
  `);

  const {
    data: customerLogs = [],
    isLoading: customerLogLoading,
    error: customerLogError,
  } = useCustomerLogs<CustomerLog>(
    currentOrgId!,
    `id, action, organization_members:performed_by(
      user_email`
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        <div className="mb-4"></div>
        <div className="mb-4"></div>
        <div className="flex gap-2 items-center justify-between">
          <Link
            href={`/dashboard/invite-member?org=${currentOrgId}`}
            className="bg-blue-500 rounded p-2"
          >
            Invite Member
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <StatCard title="total customers" value={data?.total} />
          <StatCard title="new customers (last 30days)" value={data?.new} />
          <StatCard title="activated customers" value={data?.active} />
        </div>
        <div className="border rounded p-2 m-2">
          logs:
          {customerLogs.map((log) => (
            <div key={log.id} className="mt-4 text-gray-500">
              <div>action: {log?.action}</div>
              <div>by: {log?.organization_members?.user_email}</div>
            </div>
          ))}
        </div>

        {/* invitation list */}
        {isInvitationLoading && <div className="mt-4 text-gray-500">Loading invitations...</div>}
        {/* refresh button */}
        <div className="mb-4"></div>
        {invitationError && (
          <div className="mt-4 text-red-500">
            Error loading invitations: {invitationError.message}
          </div>
        )}
        {orgInvitations.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Organization Invitations:</h3>
            {orgInvitations.map((invitation) => (
              <div key={invitation.id} className="text-green-600 p-2 border rounded flex flex-col">
                Invited from organization: {invitation.organizations?.name}
                <JoinOrgButton
                  inviteId={invitation.organization_id}
                  orgName={invitation.organizations?.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
