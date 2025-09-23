"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">User Profile</h1>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            {user?.first_name}, {user?.last_name}, {user?.email},{user?.image}
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </label>
        </div>
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
