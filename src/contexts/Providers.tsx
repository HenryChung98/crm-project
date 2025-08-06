"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import type { QueryError, NetworkError } from "@/types/errors";

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient를 useState로 생성 (리렌더링 시 새 인스턴스 생성 방지)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분

            refetchOnWindowFocus: false, // 탭 전환 시 리페치 (기본: true)
            refetchOnMount: true, // 컴포넌트 마운트 시 리페치 (기본: true)
            refetchOnReconnect: true, // 네트워크 재연결 시 리페치 (기본: true)

            // 🔄 자동 리페치 옵션들
            refetchInterval: false, // 주기적 리페치 (밀리초 또는 false)
            refetchIntervalInBackground: false, // 백그라운드에서도 주기적 리페치

            // 🚀 성능 관련 옵션들
            notifyOnChangeProps: "all", // 어떤 속성 변경 시 리렌더링할지

            retry: (failureCount, error: NetworkError) => {
              if (error?.status === 401) return false;
              if (error?.message?.includes("network")) return failureCount < 3;
              return failureCount < 2;
            },
          },
          mutations: {
            onError: (error: QueryError) => {
              console.error("Mutation error:", error);
              // 전역 에러 토스트 등

              if ("status" in error) {
                console.error(`HTTP Status: ${error.status}`);
              }
              if ("code" in error && error.code) {
                console.error(`Error Code: ${error.code}`);
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* 개발 환경에서만 DevTools 표시 */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
