"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useOrganizationMembers } from "@/hooks/tanstack/useOrganizationMembers";

type OrgMember = {
  id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organizations: {
    name: string;
    city: string;
  } | null;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const {
    data: orgMembers = [],
    isLoading,
    error,
    isFetching,
    refetch,
  } = useOrganizationMembers<OrgMember>(`
    id, role, created_at, organization_id,
    organizations:organization_id(name, city)
  `);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">User Profile</h1>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            {user?.first_name}, {user?.last_name}, {user?.email},{user?.image}
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </label>
          {isLoading && <div className="text-blue-500">Loading membership...</div>}

          {isFetching && !isLoading && <div className="text-blue-400 text-sm">Updating...</div>}

          {error && (
            <div className="text-red-500">
              Error: {error instanceof Error ? error.message : "Unknown error"}
              <button onClick={() => refetch()} className="ml-2 text-blue-500 underline">
                Retry
              </button>
            </div>
          )}
          {/*  */}

          {/* membership list */}
          {orgMembers.map((member) => (
            <div key={member.id} className="p-2 bg-gray-50 rounded">
              <div className="text-green-600 font-medium">id: {member.organization_id}</div>
              <div className="text-green-600 font-medium">
                org name: {member.organizations?.name}
              </div>
              <div className="text-green-600 font-medium">
                org city: {member.organizations?.city}
              </div>
              <div className="text-sm text-gray-600">Role: {member.role}</div>

              <div className="text-xs text-gray-500">
                Date of Registration: {new Date(member.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
          {/*  */}
          {/* if no member */}
          {!isLoading && !error && orgMembers.length === 0 && (
            <div className="text-gray-500 italic">You have not joined any org.</div>
          )}
          {/* </div> */}

          {/* refresh button */}
          <div className="mb-4">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {/*  */}
          <div className="text-red-500">
            {orgMembers &&
              orgMembers.map((membership) => (
                <div key={membership.id} className="text-green-600">
                  Role: {membership.role}
                </div>
              ))}
          </div>
          <Link href="/dashboard/create-organization" className="text-blue-500">
            create organization
          </Link>
        </div>
        <div className="mb-4"></div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
