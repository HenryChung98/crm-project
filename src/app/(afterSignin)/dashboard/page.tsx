"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import { useOrganizationInvitationsByEmail } from "@/hooks/tanstack/useOrganizationInvitations";

import JoinOrgButton from "@/app/components/JoinOrgButton";

type OrgInvitation = {
  id: string;
  created_at: string;
  email: string;
  organization_id: string;
  organizations: {
    name: string;
  } | null;
};

export default function DashboardPage() {
  const { user, supabase } = useAuth();

  const {
    data: orgInvitations = [],
    isLoading,
    error,
    isFetching,
    refetch,
  } = useOrganizationInvitationsByEmail<OrgInvitation>(`
    id, created_at, email, organization_id,
    organizations:organization_id(name)
  `);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-500 text-sm font-bold mb-2">
            {user?.first_name}, {user?.last_name}, {user?.email}
          </label>
        </div>
        <div className="mb-4"></div>
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/profile"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Edit Profile
          </Link>
          <Link href="/dashboard/invite-member" className="bg-blue-500">
            Invite Member
          </Link>
        </div>

        {/* 조직 초대장 목록 */}
        {isLoading && <div className="mt-4 text-gray-500">Loading invitations...</div>}
        {/* 수동 새로고침 버튼 */}
        <div className="mb-4">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
          >
            {isFetching ? "새로고침 중..." : "멤버십 새로고침"}
          </button>
        </div>
        {error && (
          <div className="mt-4 text-red-500">Error loading invitations: {error.message}</div>
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
