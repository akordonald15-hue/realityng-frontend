"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  FinancingDocumentChecklist,
  FinancingOfferCard,
  FinancingStatusBadge,
} from "@/components/payments/financing-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getAdminFinancingApplication,
  recordFinancingOffer,
  submitFinancingToPartner,
} from "@/lib/api/financing";

export default function AdminFinancingDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const queryClient = useQueryClient();
  const [submissionReference, setSubmissionReference] = useState("");
  const [offerReference, setOfferReference] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [tenorMonths, setTenorMonths] = useState(6);
  const [error, setError] = useState("");

  const applicationQuery = useQuery({
    queryKey: ["admin", "financing", "applications", applicationId],
    queryFn: () => getAdminFinancingApplication(applicationId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin", "financing", "applications", applicationId],
    });
  };

  const partnerMutation = useMutation({
    mutationFn: () => submitFinancingToPartner({ applicationId, submissionReference }),
    onMutate: () => setError(""),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const offerMutation = useMutation({
    mutationFn: () =>
      recordFinancingOffer({
        applicationId,
        offerReference,
        approvedAmount,
        tenorMonths,
      }),
    onMutate: () => setError(""),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  function submitPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    partnerMutation.mutate();
  }

  function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    offerMutation.mutate();
  }

  const application = applicationQuery.data;

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Financing application review"
          description="Manual partner handoff and partner-owned offer recording."
        />

        {applicationQuery.isLoading ? (
          <p className="mt-6 text-sm text-brand-muted">Loading application...</p>
        ) : !application ? (
          <p className="mt-6 text-sm text-brand-muted">Application not found.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            <Card className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                    {application.application_reference}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-brand-text">
                    {application.product.name}
                  </h2>
                  <p className="mt-1 text-sm text-brand-muted">
                    {application.currency} {application.requested_amount} ·{" "}
                    {application.partner.name}
                  </p>
                </div>
                <FinancingStatusBadge status={application.status} />
              </div>
            </Card>

            {error ? (
              <p className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <FinancingDocumentChecklist application={application} />

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">
                Submit to partner
              </h2>
              <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={submitPartner}>
                <Input
                  required
                  placeholder="Partner submission reference"
                  value={submissionReference}
                  onChange={(e) => setSubmissionReference(e.target.value)}
                />
                <Button disabled={partnerMutation.isPending} type="submit">
                  {partnerMutation.isPending ? "Submitting..." : "Submit to partner"}
                </Button>
              </form>
            </Card>

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Record offer</h2>
              <form className="mt-3 grid gap-3 sm:grid-cols-4" onSubmit={submitOffer}>
                <Input
                  required
                  placeholder="Offer reference"
                  value={offerReference}
                  onChange={(e) => setOfferReference(e.target.value)}
                />
                <Input
                  required
                  placeholder="Approved amount"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                />
                <Input
                  min={1}
                  type="number"
                  value={tenorMonths}
                  onChange={(e) => setTenorMonths(Number(e.target.value))}
                />
                <Button disabled={offerMutation.isPending} type="submit">
                  {offerMutation.isPending ? "Recording..." : "Record offer"}
                </Button>
              </form>
            </Card>

            <section className="grid gap-3">
              <h2 className="text-lg font-semibold text-brand-text">Offers</h2>
              {application.offers.length ? (
                application.offers.map((offer) => (
                  <FinancingOfferCard key={offer.id} offer={offer} />
                ))
              ) : (
                <p className="text-sm text-brand-muted">No offers recorded.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
