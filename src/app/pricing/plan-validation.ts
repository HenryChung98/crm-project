import { SupabaseClient } from "@supabase/supabase-js";
import { PlanName } from "@/types/plan";


export interface PlanLimits {
  maxOrganizations: number;
  maxMembersPerOrg: number;
  maxCustomersPerOrg: number;
}

export interface ValidationViolation {
  type: "organizations" | "members" | "customers";
  orgId?: string;
  current: number;
  limit: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
  currentUsage: {
    organizations: number;
    totalMembers: number;
    totalCustomers: number;
  };
}

// plans 테이블에서 플랜 제한값 조회
export const getPlanLimits = async (
  supabase: SupabaseClient,
  planName: PlanName
): Promise<PlanLimits | null> => {
  try {
    const { data: plan, error } = await supabase
      .from("plans")
      .select("max_users, max_customers, max_organization_num")
      .eq("name", planName)
      .single();

    if (error) {
      console.error("Error fetching plan limits:", error);
      return null;
    }

    return {
      maxOrganizations: plan.max_organization_num || 0,
      maxMembersPerOrg: plan.max_users || 0,
      maxCustomersPerOrg: plan.max_customers || 0,
    };
  } catch (error) {
    console.error("Error in getPlanLimits:", error);
    return null;
  }
};

// 다운그레이드 여부 확인 헬퍼 함수
export const isDowngrade = (currentPlan: PlanName, targetPlan: PlanName): boolean => {
  const planOrder = { free: 0, basic: 1, premium: 2 };
  return planOrder[targetPlan] < planOrder[currentPlan];
};

// 플랜 변경 검증 함수
export const validatePlanChange = async (
  supabase: SupabaseClient,
  userId: string,
  targetPlan: PlanName,
  currentPlan?: PlanName
): Promise<ValidationResult> => {
  // DB에서 타겟 플랜의 제한값 조회
  const limits = await getPlanLimits(supabase, targetPlan);

  if (!limits) {
    throw new Error("Unable to retrieve plan limits.");
  }

  const violations: ValidationViolation[] = [];

  // 현재 조직들 조회
  const { data: organizations, error: orgError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("created_by", userId);

  if (orgError) {
    throw new Error("Unable to retrieve organization.");
  }

  const currentOrgCount = organizations?.length || 0;

  // 조직 수 검증 (다운그레이드 시에만)
  if (currentPlan && isDowngrade(currentPlan, targetPlan)) {
    if (currentOrgCount > limits.maxOrganizations) {
      violations.push({
        type: "organizations",
        current: currentOrgCount,
        limit: limits.maxOrganizations,
        message: `Currently you have ${currentOrgCount} organizations.\n${targetPlan.toUpperCase()} plan allows up to ${
          limits.maxOrganizations
        } organizations.`,
      });
    }
  }

  let totalMembers = 0;
  let totalCustomers = 0;

  // 조직이 있는 경우 멤버/고객 수 검증
  if (organizations && organizations.length > 0) {
    const orgIds = organizations.map((org) => org.id);

    // 멤버/고객 수 병렬 조회
    const [memberResult, customerResult] = await Promise.all([
      supabase.from("organization_member").select("organization_id").in("organization_id", orgIds),
      supabase.from("customers").select("organization_id").in("organization_id", orgIds),
    ]);

    totalMembers = memberResult.data?.length || 0;
    totalCustomers = customerResult.data?.length || 0;

    // 다운그레이드 시에만 각 조직별 제한 검증
    if (currentPlan && isDowngrade(currentPlan, targetPlan)) {
      for (const org of organizations) {
        const memberCount =
          memberResult.data?.filter((m) => m.organization_id === org.id).length || 0;
        const customerCount =
          customerResult.data?.filter((c) => c.organization_id === org.id).length || 0;

        // 멤버 수 검증
        if (memberCount > limits.maxMembersPerOrg) {
          violations.push({
            type: "members",
            orgId: org.id,
            current: memberCount,
            limit: limits.maxMembersPerOrg,
            message: `There are ${memberCount} members in the organization ${
              org.name
            }.\n<span class="text-blue-600 font-semibold">${targetPlan.toUpperCase()}</span> plan allows up to ${
              limits.maxMembersPerOrg
            } members.`,
          });
        }

        // 고객 수 검증
        if (customerCount > limits.maxCustomersPerOrg) {
          violations.push({
            type: "customers",
            orgId: org.id,
            current: customerCount,
            limit: limits.maxCustomersPerOrg,
            message: `There are ${customerCount} customers in the organization ${
              org.name
            }.\n${targetPlan.toUpperCase()} plan allows up to ${
              limits.maxCustomersPerOrg
            } customers.`,
          });
        }
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    currentUsage: {
      organizations: currentOrgCount,
      totalMembers,
      totalCustomers,
    },
  };
};