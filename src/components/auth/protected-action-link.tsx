"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { useOptionalAuth } from "@/providers/auth-provider";

type ProtectedActionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  actionLabel: string;
  role?: string;
  children: React.ReactNode;
};

export function ProtectedActionLink({
  href,
  actionLabel,
  role,
  children,
  onClick,
  ...props
}: ProtectedActionLinkProps) {
  const auth = useOptionalAuth();
  void actionLabel;

  if (auth?.isAuthenticated) {
    return (
      <Link href={href} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  const signUpParams = new URLSearchParams({
    next: href || "/",
    ...(role ? { role } : {}),
  });

  return (
    <Link
      href={`/auth/sign-up?${signUpParams.toString()}`}
      onClick={(event) => {
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
