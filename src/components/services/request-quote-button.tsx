"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createQuoteRequest,
  type PreferredContactMethod,
  type ServiceProvider,
} from "@/lib/api/services";
import { useOptionalAuth } from "@/providers/auth-provider";

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export function RequestQuoteButton({ provider }: { provider: ServiceProvider }) {
  const auth = useOptionalAuth();
  const user = auth?.user;
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createQuoteRequest(provider.slug, {
        service_category_id: field(form, "service_category_id") || undefined,
        customer_name: field(form, "customer_name"),
        project_title: field(form, "project_title"),
        project_description: field(form, "project_description"),
        budget_range: field(form, "budget_range"),
        preferred_contact_method: field(form, "preferred_contact_method") as PreferredContactMethod,
        phone: field(form, "phone"),
        email: field(form, "email"),
        property_address: field(form, "property_address"),
        state: field(form, "state"),
        lga: field(form, "lga"),
        preferred_start_date: field(form, "preferred_start_date") || undefined,
      }),
    onSuccess: () => {
      setError("");
      setIsSuccess(true);
    },
    onError: (requestError) => setError(getApiErrorMessage(requestError)),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <>
      <Button className="w-full" onClick={() => setIsOpen(true)}>
        Request Quote
      </Button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 sm:items-center"
          role="dialog"
        >
          <Card className="max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">
                  Request quotation
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-brand-text">
                  Tell {provider.business_name} what you need.
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Step 1 of 1: share project details so the provider can contact you directly.
                </p>
              </div>
              <button
                aria-label="Close quote request"
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-brand-muted"
                onClick={() => {
                  setIsOpen(false);
                  setIsSuccess(false);
                }}
                type="button"
              >
                Close
              </button>
            </div>

            {isSuccess ? (
              <div className="mt-6 rounded-md border border-brand-secondary/30 bg-brand-secondary/10 p-5">
                <h3 className="font-heading text-2xl font-semibold text-brand-text">
                  Your request has been sent.
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  The provider will contact you shortly using your preferred contact method.
                </p>
                <Button className="mt-5" onClick={() => setIsOpen(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Service category
                  <Select name="service_category_id">
                    <option value="">Let provider advise</option>
                    {provider.trades.map((trade) => (
                      <option key={trade.id} value={trade.category.id}>
                        {trade.category.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Preferred contact
                  <Select defaultValue="whatsapp" name="preferred_contact_method">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                  </Select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text sm:col-span-2">
                  Project title
                  <Input name="project_title" placeholder="e.g. Repair inverter wiring" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text sm:col-span-2">
                  Project details
                  <textarea
                    className="min-h-28 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                    name="project_description"
                    placeholder="Describe the work, urgency, property type, and any access notes."
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Your name
                  <Input defaultValue={user?.full_name ?? ""} name="customer_name" required={!user} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Budget range
                  <Input name="budget_range" placeholder="e.g. NGN 100,000 - 250,000" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Phone
                  <Input defaultValue={user?.phone_number ?? ""} name="phone" required={!user} />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Email
                  <Input defaultValue={user?.email ?? ""} name="email" required={!user} type="email" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text sm:col-span-2">
                  Property address
                  <Input name="property_address" placeholder="Nearest safe address or landmark" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  State
                  <Input defaultValue={provider.state} name="state" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  LGA
                  <Input defaultValue={provider.lga ?? ""} name="lga" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-brand-text">
                  Preferred start date
                  <Input name="preferred_start_date" type="date" />
                </label>
                {error ? (
                  <div className="sm:col-span-2">
                    <FormMessage tone="error">{error}</FormMessage>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <Button disabled={mutation.isPending} type="submit">
                    {mutation.isPending ? "Sending..." : "Send quote request"}
                  </Button>
                  <Button onClick={() => setIsOpen(false)} type="button" variant="secondary">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      ) : null}
    </>
  );
}
