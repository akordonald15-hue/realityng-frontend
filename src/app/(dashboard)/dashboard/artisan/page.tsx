"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { ProviderCompletenessChecklist } from "@/components/services/provider-completeness-checklist";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createProviderProfile,
  getMyProviderProfile,
  submitProviderProfile,
} from "@/lib/api/services";

export default function ArtisanDashboardPage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["my-provider-profile"],
    queryFn: getMyProviderProfile,
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
    onSuccess: (data) => queryClient.setQueryData(["my-provider-profile"], data),
  });

  const submitMutation = useMutation({
    mutationFn: submitProviderProfile,
    onSuccess: (data) => queryClient.setQueryData(["my-provider-profile"], data),
  });

  const profile = profileQuery.data;
  const error = profileQuery.isError ? getApiErrorMessage(profileQuery.error) : "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Artisan dashboard"
        title="Provider profile command centre"
        description="Create your services profile, complete trades and service areas, upload portfolio images, and track RealityNG moderation."
      />

      {!profile && !profileQuery.isLoading ? (
        <Card className="mt-8 p-6">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Create your provider profile
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
            Start a draft profile before adding trades, service areas, and portfolio samples.
            Profiles become public only after admin approval.
          </p>
          {createMutation.isError || error ? (
            <div className="mt-4">
              <FormMessage tone="error">
                {createMutation.isError ? getApiErrorMessage(createMutation.error) : error}
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

      {profile ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <ProviderStatusBadge status={profile.status} />
                <h2 className="mt-4 font-heading text-3xl font-semibold text-brand-text">
                  {profile.business_name || "Untitled provider profile"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-brand-muted">
                  {profile.headline || "Add a headline that explains your strongest service."}
                </p>
              </div>
              {profile.status === "active" ? (
                <Link className={buttonClasses("secondary")} href={`/services/providers/${profile.slug}`}>
                  Public profile
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-2xl font-bold text-brand-text">{profile.trades.length}</p>
                <p className="text-sm text-brand-muted">Trades</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-brand-text">{profile.service_areas.length}</p>
                <p className="text-sm text-brand-muted">Service areas</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-brand-text">{profile.portfolio_count ?? 0}</p>
                <p className="text-sm text-brand-muted">Portfolio images</p>
              </Card>
            </div>

            {submitMutation.isError ? (
              <div className="mt-5">
                <FormMessage tone="error">{getApiErrorMessage(submitMutation.error)}</FormMessage>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className={buttonClasses("primary")} href="/dashboard/artisan/profile">
                Manage profile
              </Link>
              <Link className={buttonClasses("secondary")} href="/dashboard/artisan/portfolio">
                Manage portfolio
              </Link>
              <Link className={buttonClasses("secondary")} href="/dashboard/artisan/quote-requests">
                Quote requests
              </Link>
              <Link className={buttonClasses("secondary")} href="/dashboard/artisan/reviews">
                Reviews
              </Link>
              <Button
                disabled={submitMutation.isPending || profile.status === "pending_review"}
                onClick={() => submitMutation.mutate()}
                variant="secondary"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit for review"}
              </Button>
            </div>
          </Card>
          <ProviderCompletenessChecklist completion={profile.completion} />
        </div>
      ) : null}
    </main>
  );
}
