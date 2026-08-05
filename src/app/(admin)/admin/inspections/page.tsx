"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { InspectionRequestCard, WalkthroughModerationCard } from "@/components/inspections/inspection-widgets";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdminInspectionDashboard } from "@/lib/api/inspections";

const adminActions = [
  {
    href: "/admin/inspections/requests",
    label: "Inspection requests",
    description: "Approve, reject, request information, and assign inspectors.",
  },
  {
    href: "/admin/inspections/walkthroughs",
    label: "Walkthrough moderation",
    description: "Approve or reject property videos before they become public.",
  },
  {
    href: "/admin/inspections/reports",
    label: "Report review",
    description: "Moderate submitted inspection reports and evidence access.",
  },
  {
    href: "/admin/inspections/inspectors",
    label: "Inspector profiles",
    description: "Review approved inspector capacity and service coverage.",
  },
];

export default function AdminInspectionsDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-inspection-dashboard"],
    queryFn: getAdminInspectionDashboard,
  });
  const dashboard = dashboardQuery.data;

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Inspection operations"
          description="Review inspection requests, moderated walkthroughs, inspector assignments, submitted reports, and evidence workflows."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {adminActions.map((action) => (
            <Link className="rounded-md border border-white/10 bg-white/5 p-4" href={action.href} key={action.href}>
              <p className="font-semibold text-brand-text">{action.label}</p>
              <p className="mt-1 text-sm leading-5 text-brand-muted">{action.description}</p>
            </Link>
          ))}
        </div>

        {dashboardQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading inspection operations...</Card>
        ) : null}
        {dashboard ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
                  Recent requests
                </h2>
                <Link className={buttonClasses("secondary")} href="/admin/inspections/requests">
                  Open queue
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                {dashboard.recent_requests.map((request) => (
                  <InspectionRequestCard
                    href={`/admin/inspections/requests/${request.id}`}
                    key={request.id}
                    request={request}
                  />
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
                  Pending walkthroughs
                </h2>
                <Link className={buttonClasses("secondary")} href="/admin/inspections/walkthroughs">
                  Moderate
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                {(dashboard.pending_walkthroughs ?? []).map((walkthrough) => (
                  <WalkthroughModerationCard key={walkthrough.id} walkthrough={walkthrough} />
                ))}
                {(dashboard.pending_walkthroughs ?? []).length === 0 ? (
                  <p className="text-sm text-brand-muted">No walkthrough videos need review.</p>
                ) : null}
              </div>
            </Card>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
