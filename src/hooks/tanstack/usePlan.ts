"use client";

import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "@/types/errors";
import { SubscribedPlan } from "@/types/database/plan";
import { hasSubscription, getPlanByOrg } from "../hook-actions/get-plans";
import { useMemo, useCallback } from "react";
import {
  getUsageForOrg,
  type UsageByOrganization,
} from "../hook-actions/get-usage";

type SubscriptionResult = {
  hasSubscription: boolean | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useSubscriptionCheck = (): SubscriptionResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["subscription", "check"],
    queryFn: hasSubscription,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 
    refetchOnWindowFocus: false, 
  });

  return {
    hasSubscription: data,
    isLoading,
    error,
    refetch,
  };
};


type OrgQuotaType = "customers" | "users";

type BaseLimits = {
  maxCustomers: number;
  maxOrganizations: number;
  maxUsers: number;
  planName: string;
  planId: string;
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

const queryOptions = {
  plan: {
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: true,
    retry: (failureCount: number, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  },
  usage: {
    staleTime: 1000 * 30, // 30초
    refetchOnWindowFocus: true,
    retry: (failureCount: number, error: NetworkError) => {
      if (error?.code === "PGRST301") return false;
      return failureCount < 3;
    },
  },
};

export const usePlanByOrg = (orgId: string): OrgPlanResult => {
  const planResult = useQuery({
    queryKey: ["plans", "org", orgId],
    queryFn: () => getPlanByOrg(orgId),
    enabled: !!orgId,
    ...queryOptions.plan,
  });

  const usageResult = useQuery({
    queryKey: ["usage", "org", orgId],
    queryFn: () => getUsageForOrg(orgId),
    enabled: !!orgId && !!planResult.data,
    ...queryOptions.usage,
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
  }, [planResult.data?.plans]);

  const canAddCustomer = useCallback((): boolean => {
    if (!limits || !usageResult.data) return false;
    return usageResult.data.customerTotal < limits.maxCustomers;
  }, [limits, usageResult.data]);

  const canAddUser = useCallback((): boolean => {
    if (!limits || !usageResult.data) return false;
    return usageResult.data.userTotal < limits.maxUsers;
  }, [limits, usageResult.data]);

  const getRemainingQuota = useCallback(
    (type: OrgQuotaType): number => {
      if (!limits || !usageResult.data) return 0;

      const usage = usageResult.data;
      if (type === "customers") {
        return Math.max(0, limits.maxCustomers - usage.customerTotal);
      }
      if (type === "users") {
        return Math.max(0, limits.maxUsers - usage.userTotal);
      }
      return 0;
    },
    [limits, usageResult.data]
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
    currentUsage: usageResult.data,
    canAddCustomer,
    canAddUser,
    getRemainingQuota,
  };
};