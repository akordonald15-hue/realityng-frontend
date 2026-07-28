"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { useOptionalAuth } from "@/providers/auth-provider";

const marketplaceLinks = [
  { href: "/properties?listing_type=sale", label: "Buy" },
  { href: "/properties?listing_type=rent", label: "Rent" },
  { href: "/properties?property_type=shortlet", label: "Shortlets" },
  { href: "/properties?property_type=land", label: "Land" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
];

const moreLinks = [
  { href: "/about", label: "About RealityNG" },
  { href: "/verification-standards", label: "Verification standards" },
  { href: "/listing-standards", label: "Listing standards" },
  { href: "/safety", label: "Safety" },
  { href: "/#diaspora", label: "Diaspora services" },
  { href: "/#artisans", label: "Artisans" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
];

const accountLinks = [
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
  const protectedAccountLinks = accountLinks.map((link) => ({
    ...link,
    href: isAuthenticated ? link.href : `/auth/sign-up?next=${encodeURIComponent(link.href)}`,
  }));

  function isActive(href: string) {
    const targetPath = href.split("?")[0].split("#")[0];
    return pathname === targetPath;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-background/95 shadow-[0_10px_40px_rgba(0,0,0,0.14)] backdrop-blur">
      <nav className="flex min-h-16 w-full items-center justify-between gap-4 px-3 py-2 sm:px-4 lg:min-h-[4.75rem]">
        <Link aria-label="RealityNG home" className="hidden shrink-0 items-center lg:flex" href="/">
          <BrandLogo
            className="h-12 w-auto object-contain xl:h-14"
            priority
            showTagline
            taglineClassName="text-[0.48rem] xl:text-[0.54rem]"
          />
        </Link>
        <Link aria-label="RealityNG home" className="flex shrink-0 items-center lg:hidden" href="/">
          <BrandLogo
            className="h-11 w-auto object-contain sm:h-12"
            priority
            showTagline={false}
          />
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold text-brand-muted lg:flex xl:gap-7">
          {marketplaceLinks.map((link) => (
            <Link
              className="rounded-sm py-2 transition hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <ProtectedActionLink
            actionLabel="List property"
            className="rounded-sm py-2 transition hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
            href="/properties/new"
          >
            List a Property
          </ProtectedActionLink>
          <details className="group relative">
            <summary className="list-none rounded-sm py-2 text-brand-muted transition hover:cursor-pointer hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary">
              More
            </summary>
            <div className="absolute right-0 top-full mt-3 w-64 rounded-md border border-white/10 bg-brand-surface p-2 shadow-glow">
              {moreLinks.map((link) => (
                <Link
                  className="block rounded-sm px-3 py-2 text-sm text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
        <div className="hidden min-w-[8.75rem] items-center justify-end gap-4 text-sm font-medium text-brand-muted lg:flex">
          {!isLoading && isAuthenticated ? (
            <>
              {protectedAccountLinks.slice(0, 1).map((link) => (
                <Link
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="transition hover:text-brand-text"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
              <details className="group relative">
                <summary className={buttonClasses("secondary", "h-10 list-none hover:cursor-pointer")}>
                  Account
                </summary>
                <div className="absolute right-0 top-full mt-3 w-52 rounded-md border border-white/10 bg-brand-surface p-2 shadow-glow">
                  {protectedAccountLinks.slice(1).map((link) => (
                    <Link
                      className="block rounded-sm px-3 py-2 text-sm text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    className="block w-full rounded-sm px-3 py-2 text-left text-sm text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                    onClick={() => void auth?.signOut()}
                    type="button"
                  >
                    Sign out
                  </button>
                </div>
              </details>
            </>
          ) : (
            <Link
              className="rounded-full bg-brand-secondary px-5 py-2.5 text-sm font-semibold text-brand-background shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition hover:bg-brand-lightGold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background xl:px-6"
              href="/auth/sign-in"
            >
              Join / Sign in
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="h-10 w-10 border border-white/10 p-0 lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
            variant="ghost"
          >
            <span aria-hidden="true" className="grid gap-1">
              <span className={isOpen ? "h-0.5 w-5 translate-y-1.5 rotate-45 bg-current" : "h-0.5 w-5 bg-current"} />
              <span className={isOpen ? "h-0.5 w-5 opacity-0" : "h-0.5 w-5 bg-current"} />
              <span className={isOpen ? "h-0.5 w-5 -translate-y-1.5 -rotate-45 bg-current" : "h-0.5 w-5 bg-current"} />
            </span>
          </Button>
        </div>
      </nav>
      <div
        className={isOpen ? "border-t border-white/10 px-3 py-4 sm:px-4 lg:hidden" : "hidden"}
        id="mobile-navigation"
      >
        <div className="grid w-full gap-2 text-sm font-medium">
          <Link
            className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
            href="/"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {marketplaceLinks.map((link) => (
            <Link
              className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <ProtectedActionLink
            actionLabel="List property"
            className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
            href="/properties/new"
            onClick={() => setIsOpen(false)}
          >
            List a Property
          </ProtectedActionLink>
          <div className="my-2 border-t border-white/10" />
          {moreLinks.map((link) => (
            <Link
              className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="my-2 border-t border-white/10" />
          {!isLoading && isAuthenticated ? (
            <>
              {protectedAccountLinks.map((link) => (
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
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-3 py-2 font-semibold text-brand-secondary transition hover:bg-white/10"
                href="/auth/sign-in"
                onClick={() => setIsOpen(false)}
              >
                Join / Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
