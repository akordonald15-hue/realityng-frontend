"use client";

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
    return <main className="mx-auto max-w-7xl px-4 py-10 text-brand-muted">Loading profile...</main>;
  }

  if (!profileQuery.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6">
          <h1 className="font-heading text-3xl font-semibold text-brand-text">
            Start your provider profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand-muted">
            Create a draft before adding trades, service areas, and portfolio images.
          </p>
          {profileQuery.isError || createMutation.isError ? (
            <div className="mt-4">
              <FormMessage tone="error">
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
          >
            {createMutation.isPending ? "Creating..." : "Create draft profile"}
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ArtisanProfileForm initialProfile={profileQuery.data} />
    </main>
  );
}
