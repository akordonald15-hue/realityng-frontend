"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { QuoteRequestsList } from "@/components/services/quote-requests-list";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  adminListQuoteRequests,
  type QuoteRequestFilters,
  type QuoteRequestStatus,
} from "@/lib/api/services";

export default function AdminQuoteRequestsPage() {
  const [filters, setFilters] = useState<QuoteRequestFilters>({
    ordering: "newest",
  });

  const quoteRequestsQuery = useQuery({
    queryKey: ["admin-quote-requests", filters],
    queryFn: () => adminListQuoteRequests(filters),
  });

  function updateFilter(key: keyof QuoteRequestFilters, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  }

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            eyebrow="Admin"
            title="Service quote requests"
            description="Monitor customer enquiries, close abusive or stale requests, and keep provider leads orderly."
          />
          <Link className={buttonClasses("secondary")} href="/admin/services/providers">
            Provider queue
          </Link>
        </div>

        <Card className="mt-6 grid gap-3 p-4 md:grid-cols-3">
          <Input
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search request, customer, or provider"
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
            <QuoteRequestsList
              mode="admin"
              requests={quoteRequestsQuery.data?.results ?? []}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
