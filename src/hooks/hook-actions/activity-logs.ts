"use server";

import { ActivityLogs } from "@/types/database/activityLogs";
import { SupabaseError } from "@/types/errors";
import { withOrgAuth } from "@/utils/auth";

export async function getActivityLogs(orgId: string): Promise<ActivityLogs[]> {
  if (!orgId) return [];

  const { supabase, orgMember } = await withOrgAuth(orgId);

  const { data, error } = (await supabase
    .from("activity_logs")
    .select(
      `
    *,
    organization_members:performed_by(user_email)
  `
    )
    .eq("organization_members.user_id", orgMember?.user_id)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })) as {
    data: ActivityLogs[] | null;
    error: SupabaseError;
  };

  if (error) throw error;

  return data || [];
}
