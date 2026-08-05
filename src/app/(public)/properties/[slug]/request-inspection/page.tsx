"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createInspectionRequest,
  type InspectionRequestPayload,
  type InspectionType,
} from "@/lib/api/inspections";
import { getPublicProperty } from "@/lib/api/properties";

const initialForm = (propertyId = ""): InspectionRequestPayload => ({
  property_id: propertyId,
  inspection_type: "pre_purchase",
  purpose: "",
  description: "",
  preferred_date: "",
  alternative_date: "",
  contact_phone: "",
  contact_email: "",
  access_notes: "",
});

export default function RequestInspectionPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const propertyQuery = useQuery({
    queryKey: ["public-property", params.slug],
    queryFn: () => getPublicProperty(params.slug),
    enabled: Boolean(params.slug),
  });
  const property = propertyQuery.data;
  const [form, setForm] = useState<InspectionRequestPayload>(() => initialForm());
  const formValue = useMemo(
    () => ({ ...form, property_id: property?.id ?? form.property_id }),
    [form, property?.id],
  );
  const mutation = useMutation({
    mutationFn: createInspectionRequest,
    onSuccess: (request) => router.push(`/dashboard/inspections/${request.id}`),
  });

  function update<K extends keyof InspectionRequestPayload>(
    key: K,
    value: InspectionRequestPayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Inspection request"
          title="Request independent property evidence"
          description="Ask RealityNG operations to review the request, assign an inspector where approved, and keep report evidence inside controlled private workflows."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card className="p-5">
            {propertyQuery.isLoading ? (
              <p className="text-brand-muted">Loading property...</p>
            ) : property ? (
              <div className="mb-6 rounded-md border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-brand-text">{property.title}</p>
                <p className="mt-1 text-sm text-brand-muted">
                  {property.display_location || `${property.city}, ${property.state}`}
                </p>
              </div>
            ) : (
              <FormMessage tone="error">Property could not be loaded.</FormMessage>
            )}

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate(formValue);
              }}
            >
              <label className="block text-sm font-semibold text-brand-text">
                Inspection type
                <Select
                  className="mt-2"
                  onChange={(event) =>
                    update("inspection_type", event.target.value as InspectionType)
                  }
                  value={form.inspection_type}
                >
                  <option value="pre_purchase">Pre-purchase</option>
                  <option value="pre_rental">Pre-rental</option>
                  <option value="general">General inspection</option>
                  <option value="structural">Structural</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="land_verification">Land verification</option>
                </Select>
              </label>
              <label className="block text-sm font-semibold text-brand-text">
                Purpose
                <Input
                  className="mt-2"
                  onChange={(event) => update("purpose", event.target.value)}
                  placeholder="Example: I want confidence before renting"
                  required
                  value={form.purpose}
                />
              </label>
              <label className="block text-sm font-semibold text-brand-text">
                Project details
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="Share what the inspector should pay attention to."
                  required
                  value={form.description}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Preferred date
                  <Input
                    className="mt-2"
                    onChange={(event) => update("preferred_date", event.target.value)}
                    required
                    type="date"
                    value={form.preferred_date}
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Alternative date
                  <Input
                    className="mt-2"
                    onChange={(event) => update("alternative_date", event.target.value)}
                    type="date"
                    value={form.alternative_date ?? ""}
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-brand-text">
                  Contact phone
                  <Input
                    className="mt-2"
                    onChange={(event) => update("contact_phone", event.target.value)}
                    required
                    value={form.contact_phone}
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Contact email
                  <Input
                    className="mt-2"
                    onChange={(event) => update("contact_email", event.target.value)}
                    required
                    type="email"
                    value={form.contact_email}
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-brand-text">
                Access notes
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  onChange={(event) => update("access_notes", event.target.value)}
                  placeholder="Share any useful availability, landmark, or access context."
                  value={form.access_notes}
                />
              </label>
              {mutation.isError ? (
                <FormMessage tone="error">{getApiErrorMessage(mutation.error)}</FormMessage>
              ) : null}
              <Button disabled={mutation.isPending || !property} type="submit">
                {mutation.isPending ? "Submitting..." : "Submit inspection request"}
              </Button>
            </form>
          </Card>

          <Card className="h-fit p-5">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              What happens next
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-brand-muted">
              <li>1. RealityNG reviews the request and access context.</li>
              <li>2. An eligible inspector may be assigned after approval.</li>
              <li>3. Reports and evidence stay private behind signed access.</li>
              <li>4. Public claims are limited to moderated walkthroughs and approved signals.</li>
            </ol>
            <Link className={buttonClasses("secondary", "mt-5 w-fit")} href={`/properties/${params.slug}`}>
              Back to property
            </Link>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
