import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import { OrganizationContextQuery } from "../types/database/organizations";

// types
import { RoleName, ROLE_HIERARCHY } from "@/types/database/organizations";
import { PlanName, PLAN_HIERARCHY } from "@/types/database/plan";
import { SupabaseError } from "@/types/errors";

interface OrgAccessContext {
  user: User;
  orgMember: OrganizationContextQuery;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

/**
 * 2 API Calls
 *
 * Ensures the currently authenticated user has access to a specific organization,
 * optionally verifying their role and subscription plan.
 *
 * @param orgId - The ID of the organization to check access
 * @param idOnly - if orgMember is not need, true.
 * @param requiredRole - Optional minimum role required (e.g., 'owner', 'admin').
 * @param requiredPlan - Optional minimum plan required (e.g., 'basic', 'premium').
 * @returns An object containing:
 *   - `user`: the authenticated Supabase user object
 *   - `orgMember`: the organization membership record with optional nested organization and subscription info
 *   - `supabase`: Supabase client instance for further queries
 * @throws Error if:
 *   - `orgId` is invalid or missing
 *   - user is not authenticated
 *   - user is not a member of the organization
 *   - user role is insufficient (if `requiredRole` is specified)
 *   - subscription plan is insufficient or missing (if `requiredPlan` is specified)
 */
export async function requireOrgAccess(
  orgId: string | null | undefined,
  idOnly: boolean,
  requiredRole?: RoleName | null,
  requiredPlan?: PlanName | null,
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

  const { data: orgMember, error: orgError } = (await supabase
    .from("organization_members")
    .select(
      idOnly
        ? `
          id,
          role,
          user_email,
          organizations:organization_id(
            subscription:subscriptions(
              plan:plans(name)
            )
          )
        `
        : `
          id,
          organization_id,
          organization_name,
          role,
          organizations:organization_id(
            name,
            url,
            subscription:subscriptions(
              id,
              plan_id,
              status,
              ends_at,
              payment_status,
              plan:plans(
                name
              )
            )
          )
        `
    )
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()) as {
    data: OrganizationContextQuery | null;
    error: SupabaseError;
  };

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
  if (requiredRole) {
    const userRoleLevel = ROLE_HIERARCHY[orgMember.role as RoleName]?.level ?? -1;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole].level;

    if (userRoleLevel < requiredRoleLevel) {
      const allowedRoles = Object.values(ROLE_HIERARCHY)
        .filter((role) => role.level >= requiredRoleLevel)
        .map((role) => role.name)
        .join(", ");

      throw new Error(`Insufficient permissions. Required: ${allowedRoles}`);
    }
  }
  // verify access based on plan
  if (!orgMember.organizations?.subscription?.plan.name) {
    throw new Error(`Insufficient permissions.`);
  }

  if (requiredPlan) {
    const planName = orgMember.organizations?.subscription?.plan?.name;
    if (!planName) {
      throw new Error("No active subscription");
    }

    const userPlanLevel = PLAN_HIERARCHY[planName as PlanName]?.level ?? -1;
    const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan].level;

    if (userPlanLevel < requiredPlanLevel) {
      const allowedPlans = Object.values(PLAN_HIERARCHY)
        .filter((plan) => plan.level >= requiredPlanLevel)
        .map((plan) => plan.name)
        .join(", ");

      throw new Error(`Insufficient plan. Required: ${allowedPlans}`);
    }
  }

  return { user, orgMember, supabase };
}
