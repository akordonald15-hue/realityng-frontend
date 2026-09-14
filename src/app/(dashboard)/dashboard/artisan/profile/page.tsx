"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { ArtisanProfileForm } from "@/components/services/artisan-profile-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { createProviderProfile, getMyProviderProfile } from "@/lib/api/services";

export default function ArtisanProfilePage() {
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

  if (profileQuery.isLoading) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-reality-text-secondary sm:px-6 lg:px-10">
        <div className="mx-auto max-w-reality">Loading profile...</div>
      </main>
    );
  }

  if (!profileQuery.data) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 text-reality-text-primary sm:px-6 lg:px-10">
        <div className="mx-auto max-w-reality">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-xs text-reality-text-quaternary"
          >
            <Link className="transition hover:text-reality-brand-600" href="/dashboard">
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <span>Artisan</span>
          </nav>
          <Card className="max-w-3xl p-6" variant="reality">
          <h1 className="font-display text-3xl font-semibold text-reality-text-primary">
            Become an artisan
          </h1>
          <p className="mt-3 text-sm leading-6 text-reality-text-secondary">
            Create a draft before adding trades, service areas, and portfolio images. Role approval
            and provider profile approval are separate checks.
          </p>
          {profileQuery.isError || createMutation.isError ? (
            <div className="mt-4">
              <FormMessage tone="error" variant="reality">
                {createMutation.isError
                  ? getApiErrorMessage(createMutation.error)
                  : getApiErrorMessage(profileQuery.error)}
              </FormMessage>
            </div>
          ) : null}
          <Button
            className="mt-5"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
            variant="reality"
          >
            {createMutation.isPending ? "Creating..." : "Create draft profile"}
          </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-reality-text-primary sm:px-6 lg:px-10">
      <div className="mx-auto max-w-reality">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-xs text-reality-text-quaternary"
            >
              <Link className="transition hover:text-reality-brand-600" href="/dashboard">
                Dashboard
              </Link>
              <span aria-hidden="true">/</span>
              <span>Artisan</span>
            </nav>
            <h1 className="font-display text-4xl font-semibold text-reality-text-primary">
              Become an artisan
            </h1>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full border border-reality-border-secondary px-4 text-sm font-semibold text-reality-text-secondary transition hover:bg-reality-bg-subtle"
            href="/dashboard/artisan"
          >
            Back
          </Link>
        </div>
        <ArtisanProfileForm initialProfile={profileQuery.data} />
      </div>
    </main>
  );
}

