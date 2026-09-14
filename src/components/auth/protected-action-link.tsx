"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes } from "react";
import { useCallback } from "react";

import { useRealityAuthModal } from "@/components/auth/reality-auth-modal";
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
  const router = useRouter();
  const { requireAuth } = useRealityAuthModal();
  const continueToHref = useCallback(() => {
    router.push(href);
  }, [href, router]);

  if (auth?.isAuthenticated) {
    return (
      <Link href={href} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        event.preventDefault();
        void requireAuth({
          actionLabel,
          nextPath: href || "/",
          onAuthenticated: continueToHref,
          role,
        });
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

