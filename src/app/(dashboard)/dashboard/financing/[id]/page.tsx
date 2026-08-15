"use client";

import { useState } from "react";
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
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  acceptFinancingOffer,
  consentToFinancingApplication,
  declineFinancingOffer,
  getFinancingApplication,
  submitFinancingApplication,
  uploadFinancingDocument,
} from "@/lib/api/financing";

export default function FinancingDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState("identity");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const applicationQuery = useQuery({
    queryKey: ["financing", "applications", applicationId],
    queryFn: () => getFinancingApplication(applicationId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["financing", "applications", applicationId],
    });
  };

  const consentMutation = useMutation({
    mutationFn: () => consentToFinancingApplication(applicationId),
    onMutate: () => setError(""),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const submitMutation = useMutation({
    mutationFn: () => submitFinancingApplication(applicationId),
    onMutate: () => setError(""),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose a document first.");
      return uploadFinancingDocument({ applicationId, documentType, file });
    },
    onMutate: () => setError(""),
    onSuccess: async () => {
      setFile(null);
      await refresh();
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });
  const offerMutation = useMutation({
    mutationFn: ({ offerId, action }: { offerId: string; action: "accept" | "decline" }) =>
      action === "accept" ? acceptFinancingOffer(offerId) : declineFinancingOffer(offerId),
    onMutate: () => setError(""),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const application = applicationQuery.data;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Financing application"
          description="Track partner-reviewed financing status, documents and offers."
        />

        {applicationQuery.isLoading ? (
          <p className="mt-6 text-sm text-brand-muted">Loading financing application...</p>
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
                    {application.preferred_tenor_months} months · {application.partner.name}
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    RealityNG coordinates this workflow. The financing partner owns underwriting,
                    approval, rates, repayment and collection.
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

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Consent</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Consent is required before RealityNG can submit your application to a financing
                partner.
              </p>
              <Button
                className="mt-3"
                disabled={application.consent_status === "granted" || consentMutation.isPending}
                onClick={() => consentMutation.mutate()}
              >
                {application.consent_status === "granted" ? "Consent granted" : "Grant consent"}
              </Button>
            </Card>

            <FinancingDocumentChecklist application={application} />

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Upload document</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                <select
                  className="h-11 rounded-md border border-white/10 bg-brand-surface px-3 text-sm text-brand-text"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                >
                  <option value="identity">Identity</option>
                  <option value="bank_statement">Bank statement</option>
                  <option value="income_proof">Income proof</option>
                  <option value="employment_letter">Employment letter</option>
                  <option value="property_document">Property document</option>
                </select>
                <input
                  className="text-sm text-brand-muted"
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <Button disabled={!file || uploadMutation.isPending} onClick={() => uploadMutation.mutate()}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Submit</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Submission sends the application to RealityNG operations for manual partner
                review. It is not a loan approval.
              </p>
              <Button
                className="mt-3"
                disabled={!["draft", "more_information_requested"].includes(application.status) || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit application"}
              </Button>
            </Card>

            <section className="grid gap-3">
              <h2 className="text-lg font-semibold text-brand-text">Partner offers</h2>
              {application.offers.length ? (
                application.offers.map((offer) => (
                  <FinancingOfferCard
                    key={offer.id}
                    offer={offer}
                    isPending={offerMutation.isPending}
                    onAccept={() => offerMutation.mutate({ offerId: offer.id, action: "accept" })}
                    onDecline={() =>
                      offerMutation.mutate({ offerId: offer.id, action: "decline" })
                    }
                  />
                ))
              ) : (
                <p className="text-sm text-brand-muted">No partner offers yet.</p>
              )}
            </section>

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Timeline</h2>
              <div className="mt-3 grid gap-2">
                {application.timeline_events.map((event) => (
                  <div key={event.id} className="rounded-md border border-white/10 p-3">
                    <p className="font-medium text-brand-text">{event.message}</p>
                    <p className="text-xs text-brand-muted">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
