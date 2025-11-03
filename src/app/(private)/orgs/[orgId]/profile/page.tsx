"use client";
import { useAuth } from "@/contexts/AuthContext";
export default function ProfilePage() {
  const { user, loading } = useAuth();

  return <>{user?.first_name}</>;
}
