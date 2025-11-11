"use client";
import { useState } from "react";
import { AuthProvider } from "./AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data is "fresh" for 5 minutes
        // During this period, NO refetch happens regardless of other settings
        staleTime: 1000 * 60 * 5,

        // Cache retention: 30 minutes after last use
        // Keeps data in memory even when component is unmounted
        // Not related to refetching behavior
        gcTime: 1000 * 60 * 30,

        // Do NOT refetch when switching back to this tab
        // (even if data is stale)
        refetchOnWindowFocus: false,

        // Do NOT refetch when component remounts
        // (even if data is stale)
        refetchOnMount: false,
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

export function PublicProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>{children}</>
      </AuthProvider>
      {/* {process.env.NODE_ENV === "development" && ()} */}
    </QueryClientProvider>
  );
}
