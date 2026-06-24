"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button, buttonClasses } from "@/components/ui/button";
import { useOptionalAuth } from "@/providers/auth-provider";

const publicLinks = [{ href: "/properties", label: "Browse properties" }];
const protectedLinks = [
  { href: "/saved-properties", label: "Saved" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const auth = useOptionalAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isLoading = auth?.isLoading ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const listPropertyHref = isAuthenticated
    ? "/properties/new"
    : "/auth/sign-up?next=%2Fproperties%2Fnew";
  const navigationLinks = [
    ...publicLinks,
    ...protectedLinks.map((link) => ({
      ...link,
      href: isAuthenticated ? link.href : `/auth/sign-up?next=${encodeURIComponent(link.href)}`,
    })),
  ];

  function isActive(href: string) {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-background/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link aria-label="RealityNG home" className="flex shrink-0 items-center" href="/">
          <BrandLogo className="h-11 w-auto object-contain sm:h-12" priority treatment="light" />
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-brand-muted lg:flex">
          {navigationLinks.map((link) => (
            <Link
              aria-current={isActive(link.href) ? "page" : undefined}
              className={
                isActive(link.href)
                  ? "text-brand-text transition hover:text-brand-text"
                  : "transition hover:text-brand-text"
              }
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          {!isLoading && isAuthenticated ? (
            <Button className="h-10" onClick={() => void auth?.signOut()} variant="ghost">
              Sign out
            </Button>
          ) : (
            <>
              <Link className="transition hover:text-brand-text" href="/auth/sign-in">
                Sign in
              </Link>
              <Link className={buttonClasses("secondary", "h-10")} href="/auth/sign-up">
                Create account
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            className={buttonClasses("primary", "hidden h-10 sm:inline-flex")}
            href={listPropertyHref}
          >
            List property
          </Link>
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="h-10 w-10 border border-white/10 p-0 lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {isOpen ? "x" : "="}
            </span>
          </Button>
        </div>
      </nav>
      <div
        className={isOpen ? "border-t border-white/10 px-5 py-4 lg:hidden" : "hidden"}
        id="mobile-navigation"
      >
        <div className="mx-auto grid max-w-7xl gap-2 text-sm font-medium">
          <Link
            className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
            href="/"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {navigationLinks.map((link) => (
            <Link
              className={
                isActive(link.href)
                  ? "rounded-md bg-white/10 px-3 py-2 text-brand-text"
                  : "rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
              }
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isLoading && isAuthenticated ? (
            <Button
              className="w-full justify-start"
              onClick={() => {
                setIsOpen(false);
                void auth?.signOut();
              }}
              variant="ghost"
            >
              Sign out
            </Button>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                href="/auth/sign-in"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
              <Link
                className="rounded-md px-3 py-2 font-semibold text-brand-secondary transition hover:bg-white/10"
                href="/auth/sign-up"
                onClick={() => setIsOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
          <Link
            className={buttonClasses("primary", "mt-2 w-full")}
            href={listPropertyHref}
            onClick={() => setIsOpen(false)}
          >
            List property
          </Link>
        </div>
      </div>
    </header>
  );
}
