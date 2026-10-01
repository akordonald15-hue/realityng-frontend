"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { Navbar } from "@/components/layout/navbar";
import { isAdmin, isApprovedProfessional, isApprovedSupplyUser } from "@/lib/auth/permissions";
import { useOptionalAuth } from "@/providers/auth-provider";

const buyerNavigation = [
  { href: "/dashboard", label: "Home" },
  { href: "/saved-properties", label: "Saved" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/notifications", label: "Alerts" },
  { href: "/settings/profile", label: "Profile" },
];

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useOptionalAuth()?.user ?? null;
  const showBuyerNavigation = !isAdmin(user) && !isApprovedSupplyUser(user) && !isApprovedProfessional(user);

  return (
    <>
      <Navbar variant="reality" />
      <div
        className={clsx(
          "min-h-screen bg-reality-canvas [color-scheme:light]",
          showBuyerNavigation && "pb-20 md:pb-0",
        )}
      >
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
      <AssistantWidget mobileNavigationOffset={showBuyerNavigation} />
    </>
  );
}
