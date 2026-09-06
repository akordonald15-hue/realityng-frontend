"use client";

import { usePathname } from "next/navigation";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { Navbar } from "@/components/layout/navbar";
import { isAdmin, isApprovedProfessional } from "@/lib/auth/permissions";
import { useAuth } from "@/providers/auth-provider";

const customerDashboardPrefixes = [
  "/dashboard/applications",
  "/dashboard/financing",
];

function isCustomerDashboardPath(pathname: string) {
  return pathname === "/dashboard" || customerDashboardPrefixes.some((path) => pathname.startsWith(path));
}

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, user } = useAuth();
  const isLegacyDashboardUser = isAdmin(user) || isApprovedProfessional(user);
  const useRealityChrome =
    isCustomerDashboardPath(pathname) && (isLoading || !isLegacyDashboardUser);

  return (
    <>
      <Navbar variant={useRealityChrome ? "reality" : "legacy"} />
      {children}
      <AssistantWidget />
    </>
  );
}
