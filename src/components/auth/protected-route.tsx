"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/providers/auth-provider";
import { isAdmin, getRoleDashboardPath } from "@/lib/auth/permissions";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: Readonly<{ children: React.ReactNode; requireAdmin?: boolean }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAdmin && !isAdmin(user)) {
      router.replace(getRoleDashboardPath(user));
    }
  }, [isAuthenticated, isLoading, pathname, router, requireAdmin, user]);

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-6 py-10 text-brand-muted">Loading...</main>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin(user)) {
    return null;
  }

  return <>{children}</>;
}
