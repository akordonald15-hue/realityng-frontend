"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { Button, buttonClasses } from "@/components/ui/button";
import { useOptionalAuth } from "@/providers/auth-provider";
import { NotificationBell } from "@/components/layout/notification-bell";

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

type RealityDropdownId = "rent" | "sale" | "company";

type RealityNavGroup = {
  href: string;
  id?: RealityDropdownId;
  label: string;
  links?: Array<{ href: string; label: string }>;
};

const realityGroups: RealityNavGroup[] = [
  {
    id: "rent",
    label: "For Rent",
    href: "/properties?listing_type=rent",
    links: [
      { href: "/properties?listing_type=rent", label: "Homes for rent" },
      { href: "/properties?property_type=shortlet", label: "Shortlets" },
    ],
  },
  {
    id: "sale",
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
    href: "/for-professionals",
  },
  {
    label: "Services",
    href: "/services",
  },
  {
    id: "company",
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
  variant?: "reality";
  transparent?: boolean;
};

export function Navbar({ transparent = false, variant = "reality" }: NavbarProps = {}) {
  const pathname = usePathname();
  const auth = useOptionalAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isLoading = auth?.isLoading ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<RealityDropdownId | null>(null);
  const realityNavRef = useRef<HTMLDivElement>(null);
  const closeDropdownTimerRef = useRef<number | null>(null);
  const protectedAccountLinks = accountLinks.map((link) => ({
    ...link,
    href: isAuthenticated ? link.href : `/auth/sign-up?next=${encodeURIComponent(link.href)}`,
  }));

  useEffect(() => {
    if (!isOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function isActive(href: string) {
    const targetPath = href.split("?")[0].split("#")[0];
    return pathname === targetPath;
  }

  function cancelDropdownClose() {
    if (closeDropdownTimerRef.current) {
      window.clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
  }

  function openDropdown(dropdown: RealityDropdownId | null) {
    cancelDropdownClose();
    setActiveDropdown(dropdown);
  }

  function closeDropdownNow() {
    cancelDropdownClose();
    setActiveDropdown(null);
  }

  function scheduleDropdownClose() {
    cancelDropdownClose();
    closeDropdownTimerRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
      closeDropdownTimerRef.current = null;
    }, 140);
  }

  useEffect(() => {
    closeDropdownNow();
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!realityNavRef.current?.contains(event.target as Node)) {
        closeDropdownNow();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdownNow();
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      cancelDropdownClose();
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  return (
    <header
      className={clsx(
        "z-40 font-body",
        !isOpen && "backdrop-blur",
        transparent
          ? "absolute inset-x-0 top-0 text-white"
          : "sticky top-0 border-b border-reality-border-secondary bg-white/95 text-reality-text-primary",
      )}
    >
        <nav className="mx-auto flex min-h-[72px] w-full max-w-reality items-center justify-between gap-5 px-5 sm:px-6 lg:min-h-[88px] lg:px-6 2xl:px-0">
          <Link aria-label="RealityNG home" className="shrink-0" href="/">
            <BrandLogo
              className="h-8 w-auto object-contain"
              priority
              showTagline={false}
              tone={transparent ? "light" : "dark"}
            />
          </Link>
          <div
            className="hidden flex-1 items-center justify-center gap-[39px] text-sm font-normal lg:flex"
            onMouseEnter={cancelDropdownClose}
            onMouseLeave={scheduleDropdownClose}
            onPointerEnter={cancelDropdownClose}
            onPointerLeave={scheduleDropdownClose}
            ref={realityNavRef}
          >
            {realityGroups.map((group) =>
              group.links ? (
                <div
                  className="relative"
                  key={group.label}
                  onFocus={() => openDropdown(group.id ?? null)}
                  onMouseEnter={() => openDropdown(group.id ?? null)}
                  onPointerEnter={() => openDropdown(group.id ?? null)}
                >
                  <button
                    aria-expanded={activeDropdown === group.id}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-sm py-2 transition hover:cursor-pointer hover:text-reality-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                    onClick={() => {
                      cancelDropdownClose();
                      setActiveDropdown((current) =>
                        current === group.id ? null : group.id ?? null,
                      );
                    }}
                    type="button"
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon
                      className={clsx(
                        "h-4 w-4 transition",
                        activeDropdown === group.id && "rotate-180",
                      )}
                    />
                  </button>
                  {activeDropdown === group.id ? (
                    <div
                      className="reality-menu absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-reality border border-reality-border-secondary bg-white p-2 shadow-reality-sm"
                      onMouseEnter={cancelDropdownClose}
                      onPointerEnter={cancelDropdownClose}
                      role="menu"
                    >
                      {group.links.map((link) => (
                        <Link
                          className="block rounded-[8px] px-3 py-2 text-sm text-reality-text-secondary transition hover:bg-reality-bg-muted hover:text-reality-text-primary"
                          href={link.href}
                          key={link.href}
                          onClick={closeDropdownNow}
                          role="menuitem"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
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
                <NotificationBell variant="reality" />
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
                <ProtectedActionLink
                  actionLabel="Get started"
                  className={buttonClasses("reality", "h-12")}
                  href="/dashboard"
                >
                  Get Started
                </ProtectedActionLink>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <ProtectedActionLink
              actionLabel="List property"
              className={buttonClasses("realitySecondary", "min-h-10 px-3 text-xs sm:px-4 sm:text-sm")}
              href="/properties/new"
              role="landlord"
            >
              List Property
            </ProtectedActionLink>
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
          </div>
        </nav>
        {isOpen ? <div
          className={clsx(
            "fixed inset-0 z-[100] lg:hidden",
          )}
          id="mobile-navigation"
        >
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-reality-surfaceDark/55"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className={clsx(
            "absolute inset-y-0 right-0 w-1/2 min-w-[230px] max-w-[420px] overflow-y-auto overscroll-contain bg-white px-4 pb-8 pt-5 text-reality-text-primary shadow-2xl sm:px-6",
            isOpen && "reality-mobile-drawer",
          )}>
          <div className="mb-4 flex items-center justify-between border-b border-reality-border-secondary pb-4">
            <span className="font-display text-xl font-semibold">Menu</span>
            <button aria-label="Close menu" className="rounded-full border border-reality-border-secondary px-3 py-2 text-sm" onClick={() => setIsOpen(false)} type="button">Close</button>
          </div>
          <div className="grid gap-1 text-sm font-medium">
            <Link
              className="rounded-[10px] px-3 py-3 text-reality-text-secondary hover:bg-reality-bg-muted"
              href="/"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              className="rounded-[10px] px-3 py-3 text-reality-text-secondary hover:bg-reality-bg-muted"
              href="/properties"
              onClick={() => setIsOpen(false)}
            >
              Explore Properties
            </Link>
            {realityGroups.filter((group) => group.id !== "rent" && group.id !== "sale").map((group) => (
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
                <ProtectedActionLink
                  actionLabel="Get started"
                  className={buttonClasses("reality", "w-full justify-center")}
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </ProtectedActionLink>
              </div>
            )}
          </div>
          </div>
        </div> : null}
    </header>
  );
}

