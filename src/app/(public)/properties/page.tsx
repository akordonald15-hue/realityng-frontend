"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilterPanel } from "@/components/properties/property-filter-panel";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublicProperties, type PropertyFilters } from "@/lib/api/properties";

function filtersFromParams(params: URLSearchParams): PropertyFilters {
  return {
    search: params.get("search") ?? "",
    city: params.get("city") ?? "",
    property_type: params.get("property_type") ?? "",
    listing_type: params.get("listing_type") ?? "",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    ordering: params.get("ordering") ?? "-featured",
  };
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const propertiesQuery = useQuery({
    queryKey: ["public-properties", filters],
    queryFn: () => getPublicProperties(filters),
  });

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <main>
        <section className="border-b border-white/10 bg-brand-surface/45">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Browse"
              title="Verified Nigerian properties"
              description="Approved sale, rent, and apartment-share listings with gallery-aware cards and focused filters."
            />
            <div className="flex gap-3">
              <Button
                aria-controls="mobile-property-filters"
                aria-expanded={mobileFiltersOpen}
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                variant="secondary"
              >
                Filters
              </Button>
              <ProtectedActionLink
                actionLabel="List property"
                className={buttonClasses("primary")}
                href="/properties/new"
              >
                List property
              </ProtectedActionLink>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-6 lg:grid-cols-[320px_1fr]">
          <aside className="hidden lg:block">
            <PropertyFilterPanel filters={filters} onChange={setFilters} />
          </aside>
          {mobileFiltersOpen ? (
            <div className="lg:hidden" id="mobile-property-filters">
              <PropertyFilterPanel
                filters={filters}
                onChange={(nextFilters) => {
                  setFilters(nextFilters);
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          ) : null}
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-brand-muted">
                {propertiesQuery.data
                  ? `${propertiesQuery.data.count} approved listings`
                  : "Loading listings"}
              </p>
            </div>
            {propertiesQuery.isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div className="h-80 animate-pulse rounded-md bg-white/10" key={item} />
                ))}
              </div>
            ) : null}
            {propertiesQuery.isError ? (
              <Card className="p-6 text-sm text-red-200">Properties could not be loaded.</Card>
            ) : null}
            {propertiesQuery.data && propertiesQuery.data.results.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {propertiesQuery.data.results.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : null}
            {propertiesQuery.data?.results.length === 0 ? (
              <Card className="p-8 text-brand-muted">
                No approved listings match these filters.
              </Card>
            ) : null}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-background px-6 py-10 text-brand-muted">
          Loading properties...
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
