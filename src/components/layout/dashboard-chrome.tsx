"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { Navbar } from "@/components/layout/navbar";
import { hasApprovedRole, isAdmin, isApprovedProfessional, isApprovedSupplyUser } from "@/lib/auth/permissions";
import { useOptionalAuth } from "@/providers/auth-provider";

const buyerNavigation = [
  { href: "/dashboard", label: "Home" },
  { href: "/saved-properties", label: "Saved" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/notifications", label: "Alerts" },
  { href: "/settings/profile", label: "Profile" },
];

const professionalNavigation = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/properties", label: "Properties", aliases: ["/properties/new"] },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/settings/profile", label: "Profile" },
];

const providerNavigation = [
  { href: "/dashboard/artisan", label: "Overview" },
  { href: "/dashboard/artisan/profile", label: "Profile" },
  { href: "/dashboard/artisan/portfolio", label: "Portfolio" },
  { href: "/dashboard/artisan/quote-requests", label: "Requests" },
  { href: "/dashboard/messages", label: "Messages" },
];

const inspectorNavigation = [
  { href: "/dashboard/inspector", label: "Overview" },
  { href: "/dashboard/inspector/assignments", label: "Assignments" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/notifications", label: "Alerts" },
  { href: "/settings/profile", label: "Profile" },
];

function routeIsActive(pathname: string, item: { href: string; aliases?: string[] }) {
  if (item.href === "/dashboard") return pathname === item.href;
  return pathname === item.href
    || pathname.startsWith(`${item.href}/`)
    || Boolean(item.aliases?.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`)));
}

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()!;
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const showProfessionalNavigation = Boolean(user) && !isAdmin(user) && isApprovedSupplyUser(user);
  const showProviderNavigation = Boolean(user) && !isAdmin(user) && hasApprovedRole(user, "artisan");
  const showInspectorNavigation = Boolean(user) && !isAdmin(user) && hasApprovedRole(user, "inspector");
  const professionalRole = hasApprovedRole(user, "landlord") ? "Landlord" : "Agent";
  const showBuyerNavigation = Boolean(user)
    && !isAdmin(user)
    && !isApprovedSupplyUser(user)
    && !isApprovedProfessional(user);
  const workspaceNavigation = showProfessionalNavigation
    ? professionalNavigation
    : showProviderNavigation
      ? providerNavigation
      : showInspectorNavigation
        ? inspectorNavigation
        : null;
  const desktopNavigationLabel = showProfessionalNavigation
    ? "Professional workspace"
    : showProviderNavigation
      ? "Provider workspace"
      : "Inspector workspace";
  const mobileNavigationLabel = showProfessionalNavigation
    ? "Professional navigation"
    : showProviderNavigation
      ? "Provider navigation"
      : "Inspector navigation";
  const workspaceLabel = showProfessionalNavigation
    ? `${professionalRole} workspace`
    : showProviderNavigation
      ? "Provider workspace"
      : "Inspector workspace";
  const hasMobileNavigation = showBuyerNavigation || Boolean(workspaceNavigation);

  return (
    <>
      <Navbar variant="reality" />
      <div
        className={clsx(
          "min-h-screen bg-reality-canvas [color-scheme:light]",
          hasMobileNavigation && "pb-20 md:pb-0",
        )}
      >
        {workspaceNavigation ? (
          <nav
            aria-label={desktopNavigationLabel}
            className="hidden border-b border-reality-border-secondary bg-reality-surface md:block"
          >
            <div className="mx-auto flex min-h-14 w-full max-w-reality items-center justify-between gap-6 px-6 xl:px-0">
              <p className="shrink-0 text-sm font-semibold text-reality-brandEmphasis">
                {workspaceLabel}
              </p>
              <div className="flex items-stretch gap-1">
                {workspaceNavigation.map((item) => {
                  const active = routeIsActive(pathname, item);
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex min-h-14 items-center border-b-2 px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-reality-brand-600",
                        active
                          ? "border-reality-brand-600 text-reality-brandEmphasis"
                          : "border-transparent text-reality-text-secondary hover:bg-reality-surfaceMuted hover:text-reality-text-primary",
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
        ) : null}
        {children}
      </div>
      {showBuyerNavigation ? (
        <nav
          aria-label="Buyer navigation"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-reality-border-secondary bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(6,61,45,0.08)] backdrop-blur md:hidden"
        >
          {buyerNavigation.map((item) => {
            const active = item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-16 items-center justify-center px-1 text-center text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-reality-brand-600",
                  active
                    ? "bg-reality-surfaceBrand text-reality-brandEmphasis"
                    : "text-reality-text-secondary hover:bg-reality-surfaceMuted",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {workspaceNavigation ? (
        <nav
          aria-label={mobileNavigationLabel}
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-reality-border-secondary bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(6,61,45,0.08)] backdrop-blur md:hidden"
        >
          {workspaceNavigation.map((item) => {
            const active = routeIsActive(pathname, item);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-16 items-center justify-center px-1 text-center text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-reality-brand-600",
                  active
                    ? "bg-reality-surfaceBrand text-reality-brandEmphasis"
                    : "text-reality-text-secondary hover:bg-reality-surfaceMuted",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      <AssistantWidget mobileNavigationOffset={hasMobileNavigation} />
    </>
  );
}
