"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { QuoteRequestsList } from "@/components/services/quote-requests-list";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  listProviderQuoteRequests,
  type QuoteRequestFilters,
  type QuoteRequestStatus,
} from "@/lib/api/services";

export default function ArtisanQuoteRequestsPage() {
  const [filters, setFilters] = useState<QuoteRequestFilters>({
    ordering: "newest",
  });

  const quoteRequestsQuery = useQuery({
    queryKey: ["provider-quote-requests", filters],
    queryFn: () => listProviderQuoteRequests(filters),
  });

  function updateFilter(key: keyof QuoteRequestFilters, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider dashboard"
        title="Quote requests"
        description="Review customer enquiries, track first responses, and close requests after follow-up."
      />

      <Card className="mt-6 grid gap-3 p-4 md:grid-cols-3">
        <Input
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search customer, title, or location"
        />
        <Select
          onChange={(event) =>
            updateFilter("status", event.target.value as QuoteRequestStatus)
          }
          value={filters.status ?? ""}
        >
          <option value="">Any status</option>
          <option value="submitted">Submitted</option>
          <option value="viewed">Viewed</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select
          onChange={(event) => updateFilter("ordering", event.target.value)}
          value={filters.ordering ?? "newest"}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </Card>

      <div className="mt-6">
        {quoteRequestsQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading quote requests...</Card>
        ) : quoteRequestsQuery.isError ? (
          <FormMessage tone="error">
            {getApiErrorMessage(quoteRequestsQuery.error)}
          </FormMessage>
        ) : (
          <QuoteRequestsList requests={quoteRequestsQuery.data?.results ?? []} />
        )}
      </div>
    </main>
  );
}
