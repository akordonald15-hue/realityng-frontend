"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { Navbar } from "@/components/layout/navbar";

const settingsNav = [
  { href: "/settings/profile", label: "Personal information" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/verification", label: "Verification" },
];

type AccountSettingsShellProps = {
  children: React.ReactNode;
  description?: string;
  title: string;
};

export function AccountSettingsShell({
  children,
  description,
  title,
}: AccountSettingsShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-reality-text-primary">
      <Navbar variant="reality" />
      <main className="mx-auto w-full max-w-reality px-5 py-8 sm:px-6 lg:px-10 xl:py-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-reality-text-quaternary"
        >
          <Link className="transition hover:text-reality-brand-600" href="/dashboard">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span>My account</span>
        </nav>

        <header className="mt-5">
          <h1 className="font-display text-3xl font-semibold leading-tight text-reality-text-primary md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-reality-text-secondary">{description}</p>
          ) : null}
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside aria-label="Account settings" className="lg:pt-1">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-4 lg:overflow-visible lg:pb-0">
              {settingsNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500",
                      active
                        ? "border border-reality-border-primary bg-white text-reality-text-primary shadow-reality-xs"
                        : "text-reality-text-secondary hover:bg-reality-bg-subtle hover:text-reality-text-primary",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </aside>

          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}

