"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <>
      <Link href={`profile/edit`}>edit</Link>
      <div>{user?.email}</div>
    </>
  );
}
