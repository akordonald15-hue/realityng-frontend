"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { AppealForm, AppealList } from "@/components/services/governance-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getMyProviderProfile,
  listProviderAppeals,
  submitProviderAppeal,
} from "@/lib/api/services";

export default function ProviderAppealsPage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfile,
    retry: false,
  });
  const appealsQuery = useQuery({
    queryKey: ["provider-appeals"],
    queryFn: () => listProviderAppeals(),
  });
  const appealMutation = useMutation({
    mutationFn: submitProviderAppeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-appeals"] });
      queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
    },
  });

  const profile = profileQuery.data;
  const canAppeal = profile?.status === "suspended" || Boolean(profile?.warning_count);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider governance"
        title="Appeals"
        description="Submit a warning or suspension appeal for RealityNG operations review."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Submit appeal
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Appeals are reviewed by administrators and do not automatically reinstate a restricted
            profile.
          </p>
          <div className="mt-5">
            {canAppeal ? (
              <AppealForm
                isPending={appealMutation.isPending}
                onSubmit={(payload) => appealMutation.mutate(payload)}
              />
            ) : (
              <p className="text-sm text-brand-muted">
                Your profile has no current warning or suspension available for appeal.
              </p>
            )}
          </div>
          {appealMutation.isError ? (
            <div className="mt-4">
              <FormMessage tone="error">{getApiErrorMessage(appealMutation.error)}</FormMessage>
            </div>
          ) : null}
          {appealMutation.isSuccess ? (
            <div className="mt-4">
              <FormMessage tone="success">Your appeal has been submitted.</FormMessage>
            </div>
          ) : null}
        </Card>

        <section>
          {appealsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading appeals...</Card>
          ) : (
            <AppealList
              appeals={appealsQuery.data?.results ?? []}
              getHref={(appeal) => `/dashboard/artisan/appeals/${appeal.id}`}
            />
          )}
        </section>
      </div>
    </main>
  );
}
