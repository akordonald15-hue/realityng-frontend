"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { NativeBetaGate } from "@/components/beta/native-beta-gate";
import { useAuth } from "@/providers/auth-provider";
import { isAdmin, getRoleDashboardPath } from "@/lib/auth/permissions";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: Readonly<{ children: React.ReactNode; requireAdmin?: boolean }>) {
  const router = useRouter();
  const pathname = usePathname()!;
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user?.is_beta_test_account && !user.beta_native_enabled && !pathname.startsWith("/management-demo")) {
      router.replace("/management-demo");
      return;
    }

    if (requireAdmin && !isAdmin(user)) {
      router.replace(getRoleDashboardPath(user));
    }
  }, [isAuthenticated, isLoading, pathname, router, requireAdmin, user]);

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-6 py-10 text-reality-text-secondary">Loading...</main>;
  }

  if (!isAuthenticated) {
    return null;
  }
  if (user?.is_beta_test_account && !user.beta_native_enabled && !pathname.startsWith("/management-demo")) return null;

  if (requireAdmin && !isAdmin(user)) {
    return null;
  }

  return <NativeBetaGate>{children}</NativeBetaGate>;
}

