"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProviderCard } from "@/components/services/provider-card";
import { QuoteRequestStatusBadge } from "@/components/services/quote-request-status-badge";
import { ReviewCard } from "@/components/services/review-card";
import {
  ActivityTimeline,
  DashboardSection,
  DashboardStatGrid,
  EmptyDashboardState,
  QuickActionGrid,
} from "@/components/services/services-dashboard-widgets";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCustomerServicesDashboard } from "@/lib/api/services";

const quickActions = [
  {
    href: "/services",
    label: "Find artisan",
    description: "Browse approved property-service providers by category and location.",
  },
  {
    href: "/dashboard/services/reviews",
    label: "My reviews",
    description: "Track reviews submitted after completed service engagements.",
  },
  {
    href: "/dashboard/services/complaints",
    label: "My complaints",
    description: "Submit and monitor services marketplace complaints.",
  },
  {
    href: "/services?ordering=-average_rating",
    label: "Recommended providers",
    description: "Start with highly rated and reviewed providers.",
  },
];

export default function CustomerServicesDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["customer-services-dashboard"],
    queryFn: getCustomerServicesDashboard,
  });
  const dashboard = dashboardQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Services dashboard"
        title="Your service requests and trusted providers"
        description="Track quote requests, review completed engagements, and return to the providers you contacted."
      />

      {dashboardQuery.isLoading ? (
        <Card className="mt-8 p-5 text-brand-muted">Loading your services dashboard...</Card>
      ) : null}
      {dashboardQuery.isError ? (
        <Card className="mt-8 p-5 text-red-200">Services dashboard could not be loaded.</Card>
      ) : null}

      {dashboard ? (
        <div className="mt-8 space-y-8">
          <DashboardStatGrid stats={dashboard.stats} />

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <DashboardSection
              action={{ href: "/services", label: "Browse services" }}
              description="Submitted, viewed, responded, closed, and cancelled quote requests."
              title="Recent quote requests"
            >
              <div className="space-y-3">
                {dashboard.recent_quote_requests.map((quote) => (
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
                {dashboard.recent_quote_requests.length === 0 ? (
                  <EmptyDashboardState message="Quote requests you send to providers will appear here." />
                ) : null}
              </div>
            </DashboardSection>

            <DashboardSection title="Quick actions">
              <QuickActionGrid actions={quickActions} />
            </DashboardSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardSection
              action={{ href: "/dashboard/services/reviews", label: "View all reviews" }}
              description="Reviews are available only after completed service engagements."
              title="Submitted reviews"
            >
              <div className="space-y-4">
                {dashboard.submitted_reviews.slice(0, 2).map((review) => (
                  <ReviewCard key={review.id} mode="customer" review={review} />
                ))}
                {dashboard.submitted_reviews.length === 0 ? (
                  <EmptyDashboardState message="Submitted service reviews will appear here." />
                ) : null}
              </div>
            </DashboardSection>

            <DashboardSection title="Eligible reviews waiting">
              <div className="space-y-3">
                {dashboard.eligible_reviews.map((booking) => (
                  <div className="rounded-md border border-white/10 bg-white/5 p-4" key={booking.id}>
                    <p className="font-semibold text-brand-text">{booking.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {booking.provider?.business_name ?? "Service provider"}
                    </p>
                    <Link
                      className={buttonClasses("secondary", "mt-3")}
                      href={`/dashboard/services/bookings/${booking.id}/review`}
                    >
                      Leave review
                    </Link>
                  </div>
                ))}
                {dashboard.eligible_reviews.length === 0 ? (
                  <EmptyDashboardState message="Completed bookings awaiting reviews will appear here." />
                ) : null}
              </div>
            </DashboardSection>
          </div>

          <DashboardSection title="Recent activity">
            <ActivityTimeline activity={dashboard.activity} />
          </DashboardSection>

          <DashboardSection
            action={{ href: "/services?ordering=-average_rating", label: "See more" }}
            title="Recommended providers"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {dashboard.recommended_providers.slice(0, 4).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </DashboardSection>
        </div>
      ) : null}
    </main>
  );
}
