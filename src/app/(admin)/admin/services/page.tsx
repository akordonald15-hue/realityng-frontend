"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { QuoteRequestStatusBadge } from "@/components/services/quote-request-status-badge";
import { ReviewModerationList } from "@/components/services/review-moderation-list";
import { ReviewStatusBadge } from "@/components/services/review-status-badge";
import {
  ActivityTimeline,
  BreakdownList,
  DashboardSection,
  DashboardStatGrid,
  EmptyDashboardState,
  QuickActionGrid,
} from "@/components/services/services-dashboard-widgets";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdminServicesDashboard } from "@/lib/api/services";

const adminActions = [
  {
    href: "/admin/services/providers",
    label: "Provider approvals",
    description: "Review provider profiles, profile status, portfolio, trades, and service areas.",
  },
  {
    href: "/admin/services/reviews",
    label: "Review moderation",
    description: "Publish, hide, restore, remove, and dispute customer reviews.",
  },
  {
    href: "/admin/services/complaints",
    label: "Complaints",
    description: "Review, escalate, resolve, or close services marketplace complaints.",
  },
  {
    href: "/admin/services/appeals",
    label: "Appeals",
    description: "Approve, reject, or reopen warning and suspension appeals.",
  },
  {
    href: "/admin/services/quote-requests",
    label: "Quote requests",
    description: "Monitor submitted, responded, closed, and cancelled customer enquiries.",
  },
];

export default function AdminServicesDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-services-dashboard"],
    queryFn: getAdminServicesDashboard,
  });
  const dashboard = dashboardQuery.data;

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            eyebrow="Services operations"
            title="Provider marketplace control room"
            description="Monitor provider approvals, quote queues, review moderation, trust metrics, and category coverage from one place."
          />
          <Link className={buttonClasses("secondary")} href="/admin/services/providers">
            Provider queue
          </Link>
        </div>

        {dashboardQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading services operations...</Card>
        ) : null}
        {dashboardQuery.isError ? (
          <Card className="mt-8 p-5 text-red-200">Services operations could not be loaded.</Card>
        ) : null}

        {dashboard ? (
          <div className="mt-8 space-y-8">
            <DashboardStatGrid stats={dashboard.stats} />

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <DashboardSection title="Quick moderation shortcuts">
                <QuickActionGrid actions={adminActions} />
              </DashboardSection>
              <DashboardSection title="Recent moderation activity">
                <ActivityTimeline activity={dashboard.activity} />
              </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DashboardSection
                action={{ href: "/admin/services/providers", label: "Open queue" }}
                title="Pending provider approvals"
              >
                <div className="space-y-3">
                  {dashboard.pending_providers.map((provider) => (
                    <Link
                      className="block rounded-md border border-white/10 bg-white/5 p-4"
                      href={`/admin/services/providers/${provider.id}`}
                      key={provider.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-brand-text">
                            {provider.business_name || "Untitled provider"}
                          </p>
                          <p className="mt-1 text-sm text-brand-muted">
                            {provider.display_location || `${provider.city}, ${provider.state}`}
                          </p>
                        </div>
                        <ProviderStatusBadge status={provider.status} />
                      </div>
                    </Link>
                  ))}
                  {dashboard.pending_providers.length === 0 ? (
                    <EmptyDashboardState message="No provider profiles currently need moderation." />
                  ) : null}
                </div>
              </DashboardSection>

              <DashboardSection
                action={{ href: "/admin/services/quote-requests", label: "Open quotes" }}
                title="Open quote requests"
              >
                <div className="space-y-3">
                  {dashboard.open_quote_requests.map((quote) => (
                    <div className="rounded-md border border-white/10 bg-white/5 p-4" key={quote.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-brand-text">{quote.project_title}</p>
                          <p className="mt-1 text-sm text-brand-muted">
                            {quote.provider.business_name}
                          </p>
                        </div>
                        <QuoteRequestStatusBadge status={quote.status} />
                      </div>
                    </div>
                  ))}
                  {dashboard.open_quote_requests.length === 0 ? (
                    <EmptyDashboardState message="No open quote requests are waiting." />
                  ) : null}
                </div>
              </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DashboardSection
                action={{ href: "/admin/services/reviews", label: "Moderate reviews" }}
                title="Pending reviews"
              >
                {dashboard.pending_reviews.length ? (
                  <ReviewModerationList reviews={dashboard.pending_reviews.slice(0, 2)} />
                ) : (
                  <EmptyDashboardState message="No pending customer reviews." />
                )}
              </DashboardSection>

              <DashboardSection title="Flagged reviews">
                <div className="space-y-3">
                  {dashboard.flagged_reviews.map((review) => (
                    <Link
                      className="block rounded-md border border-white/10 bg-white/5 p-4"
                      href={`/admin/services/reviews/${review.id}`}
                      key={review.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="font-semibold text-brand-text">{review.title}</p>
                        {review.status ? <ReviewStatusBadge status={review.status} /> : null}
                      </div>
                    </Link>
                  ))}
                  {dashboard.flagged_reviews.length === 0 ? (
                    <EmptyDashboardState message="No flagged reviews require trust review." />
                  ) : null}
                </div>
              </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <DashboardSection title="Service category counts">
                <BreakdownList items={dashboard.category_breakdown} />
              </DashboardSection>
              <DashboardSection title="Geographic coverage">
                <BreakdownList items={dashboard.geographic_breakdown} />
              </DashboardSection>
            </div>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
