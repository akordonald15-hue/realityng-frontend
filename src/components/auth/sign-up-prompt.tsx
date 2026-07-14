"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useRoleSelection } from "@/components/auth/role-selection-modal";
import { useAuth } from "@/providers/auth-provider";

const PROMPT_DELAY_MS = 12_000;

export function SignUpPrompt() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { openRoleSelection } = useRoleSelection();
  const hasPrompted = useRef(false);
  const isDiscoveryRoute = pathname === "/" || pathname.startsWith("/properties");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      hasPrompted.current ||
      isLoading ||
      isAuthenticated ||
      !isDiscoveryRoute ||
      params.has("action")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      hasPrompted.current = true;
      openRoleSelection({
        actionLabel: "Create account",
        nextPath: pathname.startsWith("/properties") ? pathname : "/properties",
      });
    }, PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isDiscoveryRoute, isLoading, openRoleSelection, pathname]);

  return null;
}
