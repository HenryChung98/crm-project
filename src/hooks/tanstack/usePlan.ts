"use client";

import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { SubscribedPlan } from "@/types/database/plan";
import { getPlanByUser, getPlanByOrg } from "../hook-actions/get-plans";
import { useMemo, useCallback } from "react";
import {
  getUsageForOrg,
  getUsageForUser,
  type UsageByUser,
  type UsageByOrganization,
} from "../hook-actions/get-usage";

// 설정 분리
const QUERY_CONFIG = {
  PLAN_STALE_TIME: 1000 * 60 * 5, // 5분
  USAGE_STALE_TIME: 1000 * 30, // 30초
  MAX_RETRY_COUNT: 3,
} as const;

// 기본 제한 타입
type BaseLimits = {
  maxCustomers: number;
  maxOrganizations: number;
  maxUsers: number;
  planName: string;
  planId: string;
};

// 사용자 플랜 제한 타입 (조직만 해당)
type UserLimits = Pick<BaseLimits, "maxOrganizations" | "planName" | "planId">;

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

// 공통 쿼리 옵션 팩토리
const createQueryOptions = (staleTime: number) => ({
  staleTime,
  refetchOnWindowFocus: true,
  retry: (failureCount: number, error: NetworkError) => {
    if (error?.code === "PGRST301") return false;
    return failureCount < QUERY_CONFIG.MAX_RETRY_COUNT;
  },
});

// 공통 할당량 계산 로직
const calculateRemainingQuota = (limit: number, usage: number): number => {
  return Math.max(0, limit - usage);
};

export const usePlanByUser = (): UserPlanResult => {
  const planResult = useQuery({
    queryKey: ["plans", "user"],
    queryFn: getPlanByUser,
    ...createQueryOptions(QUERY_CONFIG.PLAN_STALE_TIME),
  });

  const usageResult = useQuery({
    queryKey: ["usage", "user"],
    queryFn: getUsageForUser,
    enabled: !!planResult.data,
    ...createQueryOptions(QUERY_CONFIG.USAGE_STALE_TIME),
  });

  // 성능 최적화: planId와 관련 데이터 변경시에만 재계산
  const limits = useMemo((): UserLimits | null => {
    if (!planResult.data?.plans) return null;

    const plan = planResult.data.plans;
    return {
      maxOrganizations: plan.max_organization_num,
      planName: plan.name,
      planId: plan.id,
    };
  }, [
    planResult.data?.plans?.id,
    planResult.data?.plans?.max_organization_num,
    planResult.data?.plans?.name,
  ]);

  const currentUsage = usageResult.data;

  // useCallback으로 함수 메모이제이션
  const canAddOrganization = useCallback((): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.orgTotal < limits.maxOrganizations;
  }, [limits?.maxOrganizations, currentUsage?.orgTotal]);

  const getRemainingQuota = useCallback(
    (type: UserQuotaType): number => {
      if (!limits || !currentUsage) return 0;

      switch (type) {
        case "organizations":
          return calculateRemainingQuota(limits.maxOrganizations, currentUsage.orgTotal);
        default:
          return 0;
      }
    },
    [limits?.maxOrganizations, currentUsage?.orgTotal]
  );

  const refetch = useCallback(() => {
    planResult.refetch();
    usageResult.refetch();
  }, [planResult.refetch, usageResult.refetch]);

  return {
    data: planResult.data,
    error: planResult.error,
    isLoading: planResult.isLoading || usageResult.isLoading,
    isFetching: planResult.isFetching || usageResult.isFetching,
    refetch,
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
    ...createQueryOptions(QUERY_CONFIG.PLAN_STALE_TIME),
  });

  const usageResult = useQuery({
    queryKey: ["usage", "org", orgId],
    queryFn: () => getUsageForOrg(orgId),
    enabled: !!orgId && !!planResult.data,
    ...createQueryOptions(QUERY_CONFIG.USAGE_STALE_TIME),
  });

  // 성능 최적화: 관련 데이터 변경시에만 재계산
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
  }, [
    planResult.data?.plans?.id,
    planResult.data?.plans?.max_customers,
    planResult.data?.plans?.max_organization_num,
    planResult.data?.plans?.max_users,
    planResult.data?.plans?.name,
  ]);

  const currentUsage = usageResult.data;

  const canAddCustomer = useCallback((): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.customerTotal < limits.maxCustomers;
  }, [limits?.maxCustomers, currentUsage?.customerTotal]);

  const canAddUser = useCallback((): boolean => {
    if (!limits || !currentUsage) return false;
    return currentUsage.userTotal < limits.maxUsers;
  }, [limits?.maxUsers, currentUsage?.userTotal]);

  const getRemainingQuota = useCallback(
    (type: OrgQuotaType): number => {
      if (!limits || !currentUsage) return 0;

      switch (type) {
        case "customers":
          return calculateRemainingQuota(limits.maxCustomers, currentUsage.customerTotal);
        case "users":
          return calculateRemainingQuota(limits.maxUsers, currentUsage.userTotal);
        default:
          return 0;
      }
    },
    [limits?.maxCustomers, limits?.maxUsers, currentUsage?.customerTotal, currentUsage?.userTotal]
  );

  const refetch = useCallback(() => {
    planResult.refetch();
    usageResult.refetch();
  }, [planResult.refetch, usageResult.refetch]);

  return {
    data: planResult.data || undefined,
    error: planResult.error,
    isLoading: planResult.isLoading || usageResult.isLoading,
    isFetching: planResult.isFetching || usageResult.isFetching,
    refetch,
    limits,
    currentUsage,
    canAddCustomer,
    canAddUser,
    getRemainingQuota,
  };
};
