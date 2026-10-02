"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { Navbar } from "@/components/layout/navbar";

const adminSections = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/verifications", label: "Verification" },
  { href: "/admin/inspections", label: "Inspections" },
  { href: "/admin/services", label: "Providers" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/financing", label: "Financing" },
  { href: "/admin/construction", label: "Construction" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-reality-bg-canvas">
      <Navbar variant="reality" />
      <div className="border-b border-reality-border-secondary bg-reality-bg-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Internal workspace
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">RealityNG operations</h1>
            <p className="text-sm text-emerald-50/80">Admin-only review and decision support</p>
          </div>
        </div>
      </div>
      <nav aria-label="Admin sections" className="border-b border-reality-border-secondary bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max gap-1 py-2">
            {adminSections.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "rounded-full px-4 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-reality-brand-600 focus-visible:ring-offset-2",
                    active
                      ? "bg-reality-brand-subtle text-reality-emphasis"
                      : "text-reality-text-secondary hover:bg-reality-bg-muted hover:text-reality-text-primary",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
