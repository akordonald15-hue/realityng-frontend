"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilterPanel } from "@/components/properties/property-filter-panel";
import { getPublicProperties, type PropertyFilters } from "@/lib/api/properties";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<PropertyFilters>({ ordering: "-created_at" });
  const propertiesQuery = useQuery({
    queryKey: ["public-properties", filters],
    queryFn: () => getPublicProperties(filters),
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Browse verified properties</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Approved sale and rent listings across Nigerian cities.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          href="/properties/new"
        >
          Add listing
        </Link>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <PropertyFilterPanel filters={filters} onChange={setFilters} />
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {propertiesQuery.data ? `${propertiesQuery.data.count} approved listings` : "Loading listings"}
            </p>
          </div>
          {propertiesQuery.isLoading ? <p className="text-muted">Loading properties...</p> : null}
          {propertiesQuery.isError ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Properties could not be loaded.
            </p>
          ) : null}
          <div className="space-y-4">
            {propertiesQuery.data?.results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {propertiesQuery.data?.results.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-white p-6 text-muted">
              No approved listings match these filters.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
