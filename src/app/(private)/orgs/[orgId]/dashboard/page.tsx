"use client";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const params = useParams();
  const currentOrgId = (params.orgId as string) ?? "";

  return <div>{currentOrgId} dashboard page</div>;
}
