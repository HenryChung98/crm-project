"use server";

import { createClient } from "@/utils/supabase/server";

export type Role = "owner" | "admin" | "member";

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
}

export async function getOrgMember(orgId: string): Promise<OrganizationMember | null> {
  if (!orgId || typeof orgId !== "string" || orgId.trim() === "") {
    throw new Error("Valid organization ID is required");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Access denied: Not a member of the organization");
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
}
