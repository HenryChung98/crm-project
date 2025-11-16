"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";
import { ActivityLogType } from "@/types/database/activityLogs";

export async function getActivityLogsDB(orgId: string): Promise<ActivityLogType[] | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true, null, "premium");

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
    organization_members:performed_by(user_email)
    `
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
