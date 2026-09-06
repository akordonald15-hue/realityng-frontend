"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { useOptionalAuth } from "@/providers/auth-provider";
import { NotificationBell } from "@/components/layout/notification-bell";

const marketplaceLinks = [
  { href: "/properties?listing_type=sale", label: "Buy" },
  { href: "/properties?listing_type=rent", label: "Rent" },
  { href: "/properties?property_type=shortlet", label: "Shortlets" },
  { href: "/properties?property_type=land", label: "Land" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
  { href: "/services", label: "Services" },
];

const moreLinks = [
  { href: "/about", label: "About RealityNG" },
  { href: "/verification-standards", label: "Verification standards" },
  { href: "/listing-standards", label: "Listing standards" },
  { href: "/safety", label: "Safety" },
  { href: "/#diaspora", label: "Diaspora services" },
  { href: "/services", label: "Services marketplace" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
];

const accountLinks = [
  { href: "/saved-properties", label: "Saved" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/profile", label: "Profile" },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const realityGroups = [
  {
    label: "For Rent",
    href: "/properties?listing_type=rent",
    links: [
      { href: "/properties?listing_type=rent", label: "Homes for rent" },
      { href: "/properties?property_type=shortlet", label: "Shortlets" },
    ],
  },
  {
    label: "For Sale",
    href: "/properties?listing_type=sale",
    links: [
      { href: "/properties?listing_type=sale", label: "Homes for sale" },
      { href: "/properties?property_type=land", label: "Land" },
      { href: "/properties?property_type=commercial", label: "Commercial" },
    ],
  },
  {
    label: "For Professionals",
    href: "/services",
  },
  {
    label: "Company",
    href: "/about",
    links: [
      { href: "/about", label: "About RealityNG" },
      { href: "/verification-standards", label: "Verification standards" },
      { href: "/safety", label: "Safety" },
      { href: "/help", label: "Help" },
    ],
  },
];

type NavbarProps = {
  variant?: "legacy" | "reality";
  transparent?: boolean;
};

export function Navbar({ transparent = false, variant = "legacy" }: NavbarProps = {}) {
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

  if (variant === "reality") {
    return (
      <header
        className={clsx(
          "z-40 font-body backdrop-blur",
          transparent
            ? "absolute inset-x-0 top-0 text-white"
            : "sticky top-0 border-b border-reality-border-secondary bg-white/95 text-reality-text-primary",
        )}
      >
        <nav className="mx-auto flex min-h-[72px] w-full max-w-reality items-center justify-between gap-5 px-5 sm:px-6 lg:min-h-[88px] lg:px-6 2xl:px-0">
          <Link aria-label="RealityNG home" className="shrink-0" href="/">
            <BrandLogo className="h-8 w-auto object-contain" priority showTagline={false} />
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-[39px] text-sm font-normal lg:flex">
            {realityGroups.map((group) =>
              group.links ? (
                <details className="group relative" key={group.label}>
                  <summary className="flex list-none items-center gap-2 rounded-sm py-2 transition hover:cursor-pointer hover:text-reality-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500">
                    <span>{group.label}</span>
                    <ChevronDownIcon className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <div className="reality-menu absolute left-1/2 top-full mt-3 w-60 -translate-x-1/2 rounded-reality border border-reality-border-secondary bg-white p-2 shadow-reality-sm">
                    {group.links.map((link) => (
                      <Link
                        className="block rounded-[8px] px-3 py-2 text-sm text-reality-text-secondary transition hover:bg-reality-bg-muted hover:text-reality-text-primary"
                        href={link.href}
                        key={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  className="rounded-sm py-2 transition hover:text-reality-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                  href={group.href}
                  key={group.label}
                >
                  {group.label}
                </Link>
              ),
            )}
          </div>
          <div className="hidden items-center justify-end gap-[10px] text-sm font-semibold lg:flex">
            {!isLoading && isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  className="rounded-full border border-reality-border-primary bg-white px-[18px] py-3 text-reality-text-secondary shadow-reality-xs transition hover:bg-reality-bg-subtle"
                  href="/saved-properties"
                >
                  Saved
                </Link>
                <details className="group relative">
                  <summary
                    className={buttonClasses("reality", "h-12 list-none hover:cursor-pointer")}
                  >
                    Account
                  </summary>
                  <div className="reality-menu absolute right-0 top-full mt-3 w-56 rounded-reality border border-reality-border-secondary bg-white p-2 shadow-reality-sm">
                    {protectedAccountLinks.slice(1).map((link) => (
                      <Link
                        className="block rounded-[8px] px-3 py-2 text-sm text-reality-text-secondary transition hover:bg-reality-bg-muted hover:text-reality-text-primary"
                        href={link.href}
                        key={link.href}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      className="block w-full rounded-[8px] px-3 py-2 text-left text-sm text-reality-text-secondary transition hover:bg-reality-bg-muted hover:text-reality-text-primary"
                      onClick={() => void auth?.signOut()}
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <>
                <ProtectedActionLink
                  actionLabel="List property"
                  className={buttonClasses("realitySecondary", "h-12")}
                  href="/properties/new"
                  role="landlord"
                >
                  List a Property
                </ProtectedActionLink>
                <Link className={buttonClasses("reality", "h-12")} href="/auth/sign-up">
                  Get Started
                </Link>
              </>
            )}
          </div>
          <Button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            className="h-10 w-10 p-0 lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
            variant="realityGhost"
          >
            <span aria-hidden="true" className="grid gap-1">
              <span
                className={clsx(
                  "h-0.5 w-5 bg-current transition",
                  isOpen && "translate-y-1.5 rotate-45",
                )}
              />
              <span className={clsx("h-0.5 w-5 bg-current transition", isOpen && "opacity-0")} />
              <span
                className={clsx(
                  "h-0.5 w-5 bg-current transition",
                  isOpen && "-translate-y-1.5 -rotate-45",
                )}
              />
            </span>
          </Button>
        </nav>
        <div
          className={clsx(
            "reality-menu border-t border-reality-border-secondary bg-white px-5 py-4 shadow-reality-sm sm:px-6 lg:hidden",
            !isOpen && "hidden",
          )}
          id="mobile-navigation"
        >
          <div className="grid gap-1 text-sm font-medium">
            <Link
              className="rounded-[10px] px-3 py-3 text-reality-text-secondary hover:bg-reality-bg-muted"
              href="/"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {realityGroups.map((group) => (
              <div key={group.label}>
                <Link
                  className="flex rounded-[10px] px-3 py-3 text-reality-text-secondary hover:bg-reality-bg-muted"
                  href={group.href}
                  onClick={() => setIsOpen(false)}
                >
                  {group.label}
                </Link>
                {group.links ? (
                  <div className="grid gap-1 pl-3">
                    {group.links.map((link) => (
                      <Link
                        className="rounded-[10px] px-3 py-2 text-reality-text-quaternary hover:bg-reality-bg-muted"
                        href={link.href}
                        key={link.href}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="my-2 border-t border-reality-border-secondary" />
            {!isLoading && isAuthenticated ? (
              <>
                <Link
                  className="rounded-[10px] px-3 py-3 text-reality-text-secondary hover:bg-reality-bg-muted"
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                >
                  Notifications
                </Link>
                {protectedAccountLinks.map((link) => (
                  <Link
                    className={clsx(
                      "rounded-[10px] px-3 py-3 hover:bg-reality-bg-muted",
                      isActive(link.href)
                        ? "bg-reality-bg-muted text-reality-text-primary"
                        : "text-reality-text-secondary",
                    )}
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  className="mt-2 w-full justify-start"
                  onClick={() => {
                    setIsOpen(false);
                    void auth?.signOut();
                  }}
                  variant="realityGhost"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <div className="grid gap-2 pt-2">
                <ProtectedActionLink
                  actionLabel="List property"
                  className={buttonClasses("realitySecondary", "w-full justify-center")}
                  href="/properties/new"
                  onClick={() => setIsOpen(false)}
                  role="landlord"
                >
                  List a Property
                </ProtectedActionLink>
                <Link
                  className={buttonClasses("reality", "w-full justify-center")}
                  href="/auth/sign-up"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    );
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
          <BrandLogo className="h-11 w-auto object-contain sm:h-12" priority showTagline={false} />
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
            role="landlord"
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
              <NotificationBell />
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
                <summary
                  className={buttonClasses("secondary", "h-10 list-none hover:cursor-pointer")}
                >
                  Account
                </summary>
                <div className="reality-menu absolute right-0 top-full mt-3 w-52 rounded-md border border-white/10 bg-brand-surface p-2 shadow-glow">
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
              <span
                className={
                  isOpen ? "h-0.5 w-5 translate-y-1.5 rotate-45 bg-current" : "h-0.5 w-5 bg-current"
                }
              />
              <span className={isOpen ? "h-0.5 w-5 opacity-0" : "h-0.5 w-5 bg-current"} />
              <span
                className={
                  isOpen
                    ? "h-0.5 w-5 -translate-y-1.5 -rotate-45 bg-current"
                    : "h-0.5 w-5 bg-current"
                }
              />
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
            role="landlord"
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
              <Link
                className="rounded-md px-3 py-2 text-brand-muted transition hover:bg-white/10 hover:text-brand-text"
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
              >
                Notifications
              </Link>
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
