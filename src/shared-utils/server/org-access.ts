import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import { OrganizationContextQuery } from "../../types/database/organizations";

export interface OrgAccessContext {
  user: User;
  orgMember: OrganizationContextQuery;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export async function requireOrgAccess(
  orgId: string | undefined,
  requiredRoles?: string[]
): Promise<OrgAccessContext> {
  if (!orgId || typeof orgId !== "string" || orgId.trim() === "") {
    throw new Error("Valid organization ID is required");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get user:", userError?.message);
    throw new Error("Unauthorized");
  }

  const { data: orgMember, error: orgError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (orgError) {
    if (orgError.code === "PGRST116") {
      // No rows found - not a member or inactive member
      throw new Error("Access denied: Not a member of the organization");
    } else {
      console.error("Database error during org access check:", orgError);
      throw new Error(`Database error: ${orgError.message}`);
    }
  }

  if (!orgMember) {
    throw new Error("Access denied: Not a member of the organization");
  }

  // verify access based on role
  if (requiredRoles && !requiredRoles.includes(orgMember.role)) {
    throw new Error(`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`);
  }

  return { user, orgMember, supabase };
}
