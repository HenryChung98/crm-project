"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getOrgMember, OrganizationMember, Role } from "../hook-actions/org-auth";
import { FetchingSpinner } from "../../components/ui/LoadingSpinner";

// 역할 계층 정의 (숫자가 높을수록 높은 권한)
const ROLE_HIERARCHY: Record<Role, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

interface UseOrgAuthReturn {
  orgMember: OrganizationMember | null;
  isLoading: boolean;
  error: string | null;
  hasRole: (requiredRole: Role) => boolean;
  hasAnyRole: (requiredRoles: Role[]) => boolean;
  hasMinimumRole: (minimumRole: Role) => boolean;
  refetch: () => void;
}

export function useOrgAuth(orgId: string | undefined): UseOrgAuthReturn {
  const result = useQuery({
    queryKey: ["orgMember", orgId],
    queryFn: () => getOrgMember(orgId!),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2분 캐싱
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // 권한 없음이나 인증 오류는 재시도 안함
      if (
        error?.message?.includes("Access denied") ||
        error?.message?.includes("not authenticated")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 정확한 역할 매치 확인
  const hasRole = useCallback(
    (requiredRole: Role): boolean => {
      return result.data?.role === requiredRole;
    },
    [result.data]
  );

  // 여러 역할 중 하나라도 매치되는지 확인
  const hasAnyRole = useCallback(
    (requiredRoles: Role[]): boolean => {
      if (!result.data) return false;
      return requiredRoles.includes(result.data.role);
    },
    [result.data]
  );

  // 최소 권한 레벨 확인 (계층적 권한)
  const hasMinimumRole = useCallback(
    (minimumRole: Role): boolean => {
      if (!result.data) return false;
      const userRoleLevel = ROLE_HIERARCHY[result.data.role];
      const requiredRoleLevel = ROLE_HIERARCHY[minimumRole];
      return userRoleLevel >= requiredRoleLevel;
    },
    [result.data]
  );

  return {
    orgMember: result.data || null,
    isLoading: result.isLoading,
    error: result.error?.message || null,
    hasRole,
    hasAnyRole,
    hasMinimumRole,
    refetch: result.refetch,
  };
}

// 권한 확인 컴포넌트
interface AuthGuardProps {
  orgId: string;
  requiredRole?: Role;
  requiredRoles?: Role[];
  minimumRole?: Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function OrgAuthGuard({
  orgId,
  requiredRole,
  requiredRoles,
  minimumRole,
  fallback,
  children,
}: AuthGuardProps) {
  const { orgMember, isLoading, error, hasRole, hasAnyRole, hasMinimumRole } = useOrgAuth(orgId);

  if (isLoading) {
    return <FetchingSpinner />;
  }

  if (error || !orgMember) {
    return <>{fallback || <div className="text-red-500">Access denied</div>}</>;
  }

  // 권한 체크 로직
  let hasPermission = false;

  if (requiredRole) {
    hasPermission = hasRole(requiredRole);
  } else if (requiredRoles) {
    hasPermission = hasAnyRole(requiredRoles);
  } else if (minimumRole) {
    hasPermission = hasMinimumRole(minimumRole);
  } else {
    // 아무 조건도 없으면 멤버이기만 하면 됨
    hasPermission = true;
  }

  return hasPermission ? (
    <>{children}</>
  ) : (
    <>{fallback || <div className="text-red-500">Access denied</div>}</>
  );
}
