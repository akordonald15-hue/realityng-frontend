"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { SuspensionBanner } from "@/components/services/governance-widgets";
import { ProviderCompletenessChecklist } from "@/components/services/provider-completeness-checklist";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { QuoteRequestStatusBadge } from "@/components/services/quote-request-status-badge";
import { ReviewCard } from "@/components/services/review-card";
import {
  ActivityTimeline,
  DashboardSection,
  DashboardStatGrid,
  EmptyDashboardState,
  QuickActionGrid,
} from "@/components/services/services-dashboard-widgets";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createProviderProfile,
  getProviderServicesDashboard,
  submitProviderProfile,
} from "@/lib/api/services";

const providerActions = [
  {
    href: "/dashboard/artisan/profile",
    label: "Edit profile",
    description: "Update public identity, trades, contact preferences, and service areas.",
  },
  {
    href: "/dashboard/artisan/portfolio",
    label: "Upload portfolio",
    description: "Add moderated work samples to strengthen marketplace trust.",
  },
  {
    href: "/dashboard/artisan/quote-requests",
    label: "View quotes",
    description: "Manage new, viewed, responded, and closed customer enquiries.",
  },
  {
    href: "/dashboard/artisan/reviews",
    label: "Reviews",
    description: "Respond to published reviews and track customer trust signals.",
  },
  {
    href: "/dashboard/artisan/complaints",
    label: "Complaints",
    description: "Track governance complaints linked to your provider profile.",
  },
  {
    href: "/dashboard/artisan/appeals",
    label: "Appeals",
    description: "Submit warning or suspension appeals through the approved workflow.",
  },
];

export default function ArtisanDashboardPage() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["provider-services-dashboard"],
    queryFn: getProviderServicesDashboard,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProviderProfile({
        provider_type: "individual",
        country: "Nigeria",
        business_name: "",
        headline: "",
        biography: "",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provider-services-dashboard"] }),
  });

  const submitMutation = useMutation({
    mutationFn: submitProviderProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provider-services-dashboard"] }),
  });

  const dashboard = dashboardQuery.data;
  const profile = dashboard?.profile;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Artisan dashboard"
        title="Provider operations command centre"
        description="Monitor profile readiness, quote requests, reviews, portfolio strength, coverage, and the next work that needs attention."
      />

      {!profile && !dashboardQuery.isLoading ? (
        <Card className="mt-8 p-6">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Create your provider profile
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
            Start a draft profile before adding trades, service areas, and portfolio samples.
            Profiles become public only after admin approval.
          </p>
          {createMutation.isError || dashboardQuery.isError ? (
            <div className="mt-4">
              <FormMessage tone="error">
                {createMutation.isError
                  ? getApiErrorMessage(createMutation.error)
                  : getApiErrorMessage(dashboardQuery.error)}
              </FormMessage>
            </div>
          ) : null}
          <Button
            className="mt-5"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Creating..." : "Create profile"}
          </Button>
        </Card>
      ) : null}

      {dashboardQuery.isLoading ? (
        <Card className="mt-8 p-5 text-brand-muted">Loading provider operations...</Card>
      ) : null}

      {dashboard && profile ? (
        <div className="mt-8 space-y-8">
          {profile.status === "suspended" ? (
            <SuspensionBanner
              expiresAt={profile.suspension_expires_at}
              reason={profile.suspended_reason}
              type={profile.suspension_type}
            />
          ) : null}

          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <ProviderStatusBadge status={profile.status} />
                <h2 className="mt-4 font-heading text-3xl font-semibold text-brand-text">
                  {profile.business_name || "Untitled provider profile"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">
                  {profile.headline || "Add a headline that explains your strongest service."}
                </p>
              </div>
              {profile.status === "active" ? (
                <Link className={buttonClasses("secondary")} href={`/services/providers/${profile.slug}`}>
                  Public profile
                </Link>
              ) : null}
            </div>
          </Card>

          <DashboardStatGrid stats={dashboard.stats} />

          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <DashboardSection title="Profile completeness">
              <ProviderCompletenessChecklist completion={profile.completion} />
              {submitMutation.isError ? (
                <div className="mt-4">
                  <FormMessage tone="error">{getApiErrorMessage(submitMutation.error)}</FormMessage>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={buttonClasses("primary")} href="/dashboard/artisan/profile">
                  Manage profile
                </Link>
                <Button
                  disabled={submitMutation.isPending || profile.status === "pending_review"}
                  onClick={() => submitMutation.mutate()}
                  variant="secondary"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit for review"}
                </Button>
              </div>
            </DashboardSection>

            <DashboardSection title="Quick actions">
              <QuickActionGrid actions={providerActions} />
            </DashboardSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardSection
              action={{ href: "/dashboard/artisan/quote-requests", label: "Manage quotes" }}
              title="Latest quote requests"
            >
              <div className="space-y-3">
                {dashboard.recent_quote_requests.map((quote) => (
                  <div className="rounded-md border border-white/10 bg-white/5 p-4" key={quote.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-text">{quote.project_title}</p>
                        <p className="mt-1 text-sm text-brand-muted">{quote.customer_name}</p>
                      </div>
                      <QuoteRequestStatusBadge status={quote.status} />
                    </div>
                  </div>
                ))}
                {dashboard.recent_quote_requests.length === 0 ? (
                  <EmptyDashboardState message="New customer quote requests will appear here." />
                ) : null}
              </div>
            </DashboardSection>

            <DashboardSection
              action={{ href: "/dashboard/artisan/reviews", label: "Manage reviews" }}
              title="Latest reviews"
            >
              <div className="space-y-4">
                {dashboard.latest_reviews.slice(0, 2).map((review) => (
                  <ReviewCard key={review.id} mode="provider" review={review} />
                ))}
                {dashboard.latest_reviews.length === 0 ? (
                  <EmptyDashboardState message="Published customer reviews will appear here." />
                ) : null}
              </div>
            </DashboardSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <DashboardSection title="Response reminders">
              <div className="space-y-3">
                {dashboard.response_reminders.map((review) => (
                  <Link
                    className="block rounded-md border border-white/10 bg-white/5 p-4"
                    href="/dashboard/artisan/reviews"
                    key={review.id}
                  >
                    <p className="font-semibold text-brand-text">{review.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Published review awaiting your response
                    </p>
                  </Link>
                ))}
                {dashboard.response_reminders.length === 0 ? (
                  <EmptyDashboardState message="Reviews waiting for provider responses will appear here." />
                ) : null}
              </div>
            </DashboardSection>

            <DashboardSection title="Recent activity">
              <ActivityTimeline activity={dashboard.activity} />
            </DashboardSection>
          </div>
        </div>
      ) : null}
    </main>
  );
}
