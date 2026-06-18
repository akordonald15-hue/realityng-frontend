"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";

export function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-6 py-10 text-muted">Loading...</main>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
