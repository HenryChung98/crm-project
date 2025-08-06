"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

import { useOrganizationInvitations } from "@/hooks/fetchData/useOrganizationInvitations";
export default function DashboardPage() {
  const { user, supabase } = useAuth();

  const { orgInvitations, orgError, isLoading } = useOrganizationInvitations();

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
          {orgInvitations.map((invitation) => (
              <div key={invitation.id} className="text-green-600">
                invited from {invitation.organization_id}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
