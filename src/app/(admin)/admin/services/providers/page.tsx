"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { adminListServiceProviders, type AdminProviderFilters } from "@/lib/api/services";

export default function AdminServiceProvidersPage() {
  const [filters, setFilters] = useState<AdminProviderFilters>({ status: "pending_review" });
  const providersQuery = useQuery({
    queryKey: ["admin-service-providers", filters],
    queryFn: () => adminListServiceProviders(filters),
  });

  function updateFilter(key: keyof AdminProviderFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Service provider moderation"
          description="Review profile submissions, requested changes, suspensions, and public marketplace readiness."
        />
        <Card className="mt-6 grid gap-3 p-4 md:grid-cols-4">
          <Input
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search provider"
          />
          <Select
            onChange={(event) => updateFilter("status", event.target.value)}
            value={filters.status}
          >
            <option value="">Any status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="active">Active</option>
            <option value="needs_more_information">Needs info</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Input onChange={(event) => updateFilter("state", event.target.value)} placeholder="State" />
          <Input onChange={(event) => updateFilter("city", event.target.value)} placeholder="City" />
        </Card>

        <div className="mt-6 grid gap-4">
          {providersQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading providers...</Card>
          ) : providersQuery.data?.results.length ? (
            providersQuery.data.results.map((provider) => (
              <Card className="p-5" key={provider.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <ProviderStatusBadge status={provider.status} />
                    <h2 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
                      {provider.business_name || "Untitled provider"}
                    </h2>
                    <p className="mt-2 text-sm text-brand-muted">
                      {provider.display_location || `${provider.city}, ${provider.state}`}
                    </p>
                  </div>
                  <Link
                    className={buttonClasses("secondary")}
                    href={`/admin/services/providers/${provider.id}`}
                  >
                    Review
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-5 text-brand-muted">No provider profiles match this queue.</Card>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
