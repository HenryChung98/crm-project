"use client";

import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { SubscribedPlan } from "@/types/plan";
import { getPlanByUser, getPlanByOrg } from "../hook-actions/get-plans";
import { useMemo } from "react";
import { 
  getUsageForOrg, 
  getUsageForUser, 
  type UsageByUser, 
  type UsageByOrganization 
} from "../hook-actions/get-usage";

// 기본 제한 타입
type BaseLimits = {
  maxCustomers: number;
  maxOrganizations: number;
  maxUsers: number;
  planName: string;
  planId: string;
};

// 사용자 플랜 제한 타입 (조직만 해당)
type UserLimits = Pick<BaseLimits, 'maxOrganizations' | 'planName' | 'planId'>;

// 쿼터 타입 정의
type UserQuotaType = "organizations";
type OrgQuotaType = "customers" | "users";

type UserPlanResult = {
  data: SubscribedPlan | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  limits: UserLimits | null;
  currentUsage: UsageByUser | null | undefined;
  canAddOrganization: () => boolean;
  getRemainingQuota: (type: UserQuotaType) => number;
};

type OrgPlanResult = {
  data: SubscribedPlan | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  limits: BaseLimits | null;
  currentUsage: UsageByOrganization | null | undefined;
  canAddCustomer: () => boolean;
  canAddUser: () => boolean;
  getRemainingQuota: (type: OrgQuotaType) => number;
};

// 공통 쿼리 옵션
const PLAN_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5, // 5분
  refetchOnWindowFocus: true,
  retry: (failureCount: number, error: NetworkError) => {
    if (error?.code === "PGRST301") return false;
    return failureCount < 3;
  },
} as const;

const USAGE_QUERY_OPTIONS = {
  staleTime: 1000 * 30, // 30초
  refetchOnWindowFocus: true,
} as const;

export const usePlanByUser = (): UserPlanResult => {
  const planResult = useQuery({
    queryKey: ["plans", "user"],
    queryFn: getPlanByUser,
    ...PLAN_QUERY_OPTIONS,
  });

  const usageResult = useQuery({
    queryKey: ["usage", "user"],
    queryFn: getUsageForUser,
    enabled: !!planResult.data,
    ...USAGE_QUERY_OPTIONS,
  });

  const limits = useMemo((): UserLimits | null => {
    if (!planResult.data?.plans) return null;

    const plan = planResult.data.plans;
    return {
      maxOrganizations: plan.max_organization_num,
      planName: plan.name,
      planId: plan.id,
    };
  }, [planResult.data]);

  const currentUsage = usageResult.data;

  const canAddOrganization = (): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.orgTotal < limits.maxOrganizations;
  };

  const getRemainingQuota = (type: UserQuotaType): number => {
    if (!limits || !currentUsage) return 0;

    switch (type) {
      case "organizations":
        return Math.max(0, limits.maxOrganizations - currentUsage.orgTotal);
      default:
        return 0;
    }
  };

  return {
    data: planResult.data,
    error: planResult.error,
    isLoading: planResult.isLoading || usageResult.isLoading,
    isFetching: planResult.isFetching || usageResult.isFetching,
    refetch: () => {
      planResult.refetch();
      usageResult.refetch();
    },
    limits,
    currentUsage,
    canAddOrganization,
    getRemainingQuota,
  };
};

export const usePlanByOrg = (orgId: string): OrgPlanResult => {
  const planResult = useQuery({
    queryKey: ["plans", "org", orgId],
    queryFn: () => getPlanByOrg(orgId),
    enabled: !!orgId,
    ...PLAN_QUERY_OPTIONS,
  });

  const usageResult = useQuery({
    queryKey: ["usage", "org", orgId],
    queryFn: () => getUsageForOrg(orgId),
    enabled: !!orgId && !!planResult.data,
    ...USAGE_QUERY_OPTIONS,
  });

  const limits = useMemo((): BaseLimits | null => {
    if (!planResult.data?.plans) return null;

    const plan = planResult.data.plans;
    return {
      maxCustomers: plan.max_customers,
      maxOrganizations: plan.max_organization_num,
      maxUsers: plan.max_users,
      planName: plan.name,
      planId: plan.id,
    };
  }, [planResult.data]);

  const currentUsage = usageResult.data;

  const canAddCustomer = (): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.customerTotal < limits.maxCustomers;
  };

  const canAddUser = (): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.userTotal < limits.maxUsers;
  };

  const getRemainingQuota = (type: OrgQuotaType): number => {
    if (!limits || !currentUsage) return 0;

    switch (type) {
      case "customers":
        return Math.max(0, limits.maxCustomers - currentUsage.customerTotal);
      case "users":
        return Math.max(0, limits.maxUsers - currentUsage.userTotal);
      default:
        return 0;
    }
  };

  return {
    data: planResult.data,
    error: planResult.error,
    isLoading: planResult.isLoading || usageResult.isLoading,
    isFetching: planResult.isFetching || usageResult.isFetching,
    refetch: () => {
      planResult.refetch();
      usageResult.refetch();
    },
    limits,
    currentUsage,
    canAddCustomer,
    canAddUser,
    getRemainingQuota,
  };
};