"use client";

import { useQuery } from "@tanstack/react-query";
import { NetworkError } from "../types/errors";
import { SubscribedPlan } from "../types/database/plan";
import { checkPlan } from "../shared-utils/server/check-plan";
import { useMemo, useCallback } from "react";
import { checkUsage, Usage } from "../shared-utils/server/check-usage";

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
  currentUsage: Usage | null | undefined;
  canAddCustomer: () => boolean;
  canAddUser: () => boolean;
  getRemainingQuota: (type: OrgQuotaType) => number;
};

const queryOptions = {
  retry: (failureCount: number, error: NetworkError) => {
    if (error?.code === "PGRST301") return false;
    return failureCount < 3;
  },
};

export const usePlan = (orgId: string): OrgPlanResult => {
  const planResult = useQuery({
    queryKey: ["plans", "org", orgId],
    queryFn: () => checkPlan(orgId),
    enabled: !!orgId,
    ...queryOptions,
  });

  const usageResult = useQuery({
    queryKey: ["usage", "org", orgId],
    queryFn: () => checkUsage(orgId),
    enabled: !!orgId && !!planResult.data,
    staleTime: 1000 * 30,
    retry: queryOptions.retry,
  });

  const limits = useMemo((): BaseLimits | null => {
    const plan = planResult.data?.plans;
    if (!plan) return null;

    return {
      maxCustomers: plan.max_customers,
      maxOrganizations: plan.max_organization_num,
      maxUsers: plan.max_users,
      planName: plan.name,
      planId: plan.id,
    };
  }, [planResult.data]);

  const hasValidData = useMemo(() => !!limits && !!usageResult.data, [limits, usageResult.data]);

  const canAddCustomer = useCallback((): boolean => {
    if (!hasValidData) return false;
    return usageResult.data!.customerTotal < limits!.maxCustomers;
  }, [hasValidData, limits, usageResult.data]);

  const canAddUser = useCallback((): boolean => {
    if (!hasValidData) return false;
    return usageResult.data!.userTotal < limits!.maxUsers;
  }, [hasValidData, limits, usageResult.data]);

  const getRemainingQuota = useCallback(
    (type: OrgQuotaType): number => {
      if (!hasValidData) return 0;

      const usage = usageResult.data!;
      if (type === "customers") {
        return Math.max(0, limits!.maxCustomers - usage.customerTotal);
      }
      if (type === "users") {
        return Math.max(0, limits!.maxUsers - usage.userTotal);
      }
      return 0;
    },
    [hasValidData, limits, usageResult.data]
  );

  const refetch = () => {
    planResult.refetch();
    usageResult.refetch();
  };

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
