"use server";

import { withOrgAuth } from "@/utils/auth";

export async function updateCustomerStatus(orgId: string | undefined) {
  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  const { supabase } = await withOrgAuth(orgId, ["owner", "admin"]);

  // Calculate the date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  try {
    const results = await Promise.allSettled([
      // 1. new → active
      supabase
        .from("customers")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", orgId)
        .lt("created_at", thirtyDaysAgo.toISOString())
        .eq("status", "new"),

      // 2. active → dormant
      supabase
        .from("customers")
        .update({
          status: "dormant",
          tag: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", orgId)
        .eq("status", "active")
        .lt("last_contacted_at", sixtyDaysAgo.toISOString()),
    ]);

    // 결과 검증
    const [activeResult, dormantResult] = results;

    if (activeResult.status === "rejected") {
      console.error("Error updating customers to active:", activeResult.reason);
      throw new Error(`Failed to update customers to active: ${activeResult.reason.message}`);
    }

    if (dormantResult.status === "rejected") {
      console.error("Error updating customers to dormant:", dormantResult.reason);
      throw new Error(`Failed to update customers to dormant: ${dormantResult.reason.message}`);
    }

    // 성공한 경우 업데이트된 행 수 확인 (선택사항)
    const activeCount = activeResult.value.count || 0;
    const dormantCount = dormantResult.value.count || 0;

    return {
      success: true,
      message: `Successfully updated customer statuses for organization ${orgId}`,
      details: {
        activatedCustomers: activeCount,
        dormantCustomers: dormantCount,
      },
    };
  } catch (error) {
    console.error("Failed to update customer statuses:", error);
    throw new Error(
      `Customer status update failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
