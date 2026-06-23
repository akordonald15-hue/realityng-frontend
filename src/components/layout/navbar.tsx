"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button, buttonClasses } from "@/components/ui/button";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Browse" },
  { href: "/saved-properties", label: "Saved" },
  { href: "/properties/new", label: "List property" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link aria-label="RealityNG home" className="flex items-center" href="/">
          <BrandLogo className="h-10 w-auto object-contain" priority />
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-brand-muted md:flex">
          {primaryLinks.slice(1).map((link) => (
            <Link
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
          <Link className="transition hover:text-brand-text" href="/auth/sign-in">
            Sign in
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className={buttonClasses("primary", "hidden h-10 sm:inline-flex")}
            href="/properties/new"
          >
            Add listing
          </Link>
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="h-10 w-10 border border-white/10 p-0 md:hidden"
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
        className={isOpen ? "border-t border-white/10 px-5 py-4 md:hidden" : "hidden"}
        id="mobile-navigation"
      >
        <div className="mx-auto grid max-w-7xl gap-2 text-sm font-medium">
          {primaryLinks.map((link) => (
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
          <Link
            className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
            href="/auth/sign-in"
            onClick={() => setIsOpen(false)}
          >
            Sign in
          </Link>
          <Link
            className={buttonClasses("primary", "mt-2 w-full")}
            href="/properties/new"
            onClick={() => setIsOpen(false)}
          >
            Add listing
          </Link>
        </div>
      </div>
    </header>
  );
}
