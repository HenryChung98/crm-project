"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useState } from "react";
import { AuthProvider } from "./AuthContext";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
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
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
