"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { usePlanByUser, usePlanByOrg } from "@/hooks/tanstack/usePlan";

export default function TestPage() {
  const { user, supabase } = useAuth();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") ?? "";

  // 사용자 레벨 훅 (조직 관리)
  const userPlan = usePlanByUser();

  // 조직 레벨 훅 (사용자/고객 관리) - orgId가 있을 때만
  const orgPlan = usePlanByOrg(currentOrgId);

  if (userPlan.isLoading || orgPlan.isLoading) {
    return <div>Loading plan data...</div>;
  }

  if (userPlan.error) {
    return <div>User Plan Error: {userPlan.error.message}</div>;
  }

  if (orgPlan.error) {
    return <div>Org Plan Error: {orgPlan.error.message}</div>;
  }

  return (
    <>
      <div>Test Page - Plan & Usage Management</div>

      {/* 사용자 레벨 정보 */}
      <div>
        <h2>User Plan Info</h2>
        {userPlan.limits && (
          <>
            <p>Plan Name: {userPlan.limits.planName}</p>
            <p>Plan ID: {userPlan.limits.planId}</p>
            <p>Max Organizations: {userPlan.limits.maxOrganizations}</p>
          </>
        )}
      </div>

      {/* 사용자 레벨 - 조직 관리 */}
      <div>
        <h3>Organization Management (User Level)</h3>
        <p>Current Usage: {userPlan.currentUsage?.orgTotal || 0}</p>

        <p>Remaining: {userPlan.getRemainingQuota("organizations")}</p>
      </div>
      <div>
        ========================================================================================
      </div>
      {/* 조직 레벨 정보 */}
      {currentOrgId && (
        <>
          <div>
            <h2>Organization Plan Info (Org ID: {currentOrgId})</h2>
            {orgPlan.limits && (
              <>
                <p>Plan Name: {orgPlan.limits.planName}</p>
                <p>Max Customers: {orgPlan.limits.maxCustomers}</p>
                <p>Max Users: {orgPlan.limits.maxUsers}</p>
              </>
            )}
          </div>

          {/* 조직 레벨 - 고객 관리 */}
          <div>
            <h3>Customer Management (Org Level)</h3>
            <p>Current Usage: {orgPlan.currentUsage?.customerTotal || 0}</p>
            <p>Remaining: {orgPlan.getRemainingQuota("customers")}</p>
          </div>

          {/* 조직 레벨 - 사용자 관리 */}
          <div>
            <h3>User Management (Org Level)</h3>
            <p>Current Usage: {orgPlan.currentUsage?.userTotal || 0}</p>

            <p>Remaining: {orgPlan.getRemainingQuota("users")}</p>
          </div>
        </>
      )}

      <div>
        ========================================================================================
      </div>
      {/* 디버그 정보 */}
      <div>
        <h3>Debug Info</h3>
        <pre>
          {JSON.stringify(
            {
              userPlan: {
                limits: userPlan.limits,
                currentUsage: userPlan.currentUsage,
              },
              orgPlan: currentOrgId
                ? {
                    limits: orgPlan.limits,
                    currentUsage: orgPlan.currentUsage,
                  }
                : "No org selected",
            },
            null,
            2
          )}
        </pre>
      </div>
    </>
  );
}
