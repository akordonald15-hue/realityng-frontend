"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { RealityAuthModalProvider } from "@/components/auth/reality-auth-modal";
import { CompareTray } from "@/components/properties/compare-tray";
import { AuthProvider } from "@/providers/auth-provider";
import { CompareProvider } from "@/providers/compare-provider";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealityAuthModalProvider>
          <CompareProvider>
            {children}
            <CompareTray />
          </CompareProvider>
        </RealityAuthModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
