"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분
        refetchOnWindowFocus: false, // 탭 전환 시 리페치 (기본: true)

        // refetchOnMount: true, // 컴포넌트 마운트 시 리페치 (기본: true)
        // refetchOnReconnect: true, // 네트워크 재연결 시 리페치 (기본: true)

        // refetchInterval: false, // 주기적 리페치 (밀리초 또는 false)
        // refetchIntervalInBackground: false, // 백그라운드에서도 주기적 리페치

        // notifyOnChangeProps: "all", // 어떤 속성 변경 시 리렌더링할지

        retry: (failureCount, error) => {
          if (error && typeof error === "object" && "status" in error && error.status === 401) {
            return false;
          }

          const maxRetries = error?.message?.includes("network") ? 3 : 2;
          return failureCount < maxRetries;
        },
      },
      mutations: {
        onError: (error) => {
          console.error("Mutation error:", error);
        },
      },
    },
  });

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
