"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import { ComplaintCard } from "@/components/services/governance-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  listMyServiceComplaints,
  submitServiceComplaint,
  type ServiceComplaintPayload,
} from "@/lib/api/services";

const initialForm: ServiceComplaintPayload = {
  provider_id: "",
  complaint_type: "customer",
  category: "service_quality",
  subject: "",
  description: "",
};

export default function CustomerComplaintsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ServiceComplaintPayload>(initialForm);
  const complaintsQuery = useQuery({
    queryKey: ["customer-service-complaints"],
    queryFn: () => listMyServiceComplaints(),
  });
  const submitMutation = useMutation({
    mutationFn: submitServiceComplaint,
    onSuccess: () => {
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["customer-service-complaints"] });
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Service governance"
        title="My complaints"
        description="Submit and track service marketplace complaints without exposing private records publicly."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">
            Submit complaint
          </h2>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitMutation.mutate(form);
            }}
          >
            <label className="block text-sm font-semibold text-brand-text">
              Provider ID
              <input
                className="mt-2 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
                onChange={(event) => setForm((current) => ({ ...current, provider_id: event.target.value }))}
                required
                value={form.provider_id}
              />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              Category
              <select
                className="mt-2 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ServiceComplaintPayload["category"],
                  }))
                }
                value={form.category}
              >
                <option value="service_quality">Service quality</option>
                <option value="provider_conduct">Provider conduct</option>
                <option value="safety">Safety</option>
                <option value="fraud">Fraud</option>
                <option value="review_abuse">Review abuse</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              Subject
              <input
                className="mt-2 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                required
                value={form.subject}
              />
            </label>
            <label className="block text-sm font-semibold text-brand-text">
              Description
              <textarea
                className="mt-2 min-h-32 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
                value={form.description}
              />
            </label>
            {submitMutation.isError ? (
              <FormMessage tone="error">{getApiErrorMessage(submitMutation.error)}</FormMessage>
            ) : null}
            {submitMutation.isSuccess ? (
              <FormMessage tone="success">Your complaint has been sent to operations.</FormMessage>
            ) : null}
            <Button disabled={submitMutation.isPending} type="submit">
              {submitMutation.isPending ? "Submitting..." : "Submit complaint"}
            </Button>
          </form>
        </Card>

        <section className="space-y-4">
          {complaintsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading complaints...</Card>
          ) : null}
          {complaintsQuery.data?.results.map((complaint) => (
            <ComplaintCard complaint={complaint} key={complaint.id} />
          ))}
          {complaintsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No complaints submitted yet.</Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}
