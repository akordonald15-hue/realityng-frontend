"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { useOptionalAuth } from "@/providers/auth-provider";
import { useRoleSelection } from "@/components/auth/role-selection-modal";

type ProtectedActionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  actionLabel: string;
  children: React.ReactNode;
};

export function ProtectedActionLink({
  href,
  actionLabel,
  children,
  onClick,
  ...props
}: ProtectedActionLinkProps) {
  const auth = useOptionalAuth();
  const { openRoleSelection } = useRoleSelection();

  if (auth?.isAuthenticated) {
    return (
      <Link href={href} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        openRoleSelection({
          actionLabel,
          nextPath: href || `${window.location.pathname}${window.location.search}`,
        });
      }}
      {...props}
    >
      {children}
    </a>
  );
}
