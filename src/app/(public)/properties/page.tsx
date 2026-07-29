"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PropertyMapPanel } from "@/components/maps/property-map-panel";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilterPanel } from "@/components/properties/property-filter-panel";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublicProperties, type PropertyFilters } from "@/lib/api/properties";

function filtersFromParams(params: URLSearchParams): PropertyFilters {
  return {
    search: params.get("search") ?? "",
    state: params.get("state") ?? "",
    city: params.get("city") ?? "",
    lga: params.get("lga") ?? "",
    neighborhood: params.get("neighborhood") ?? "",
    property_type: params.get("property_type") ?? "",
    listing_type: params.get("listing_type") ?? "",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    ordering: params.get("ordering") ?? "-featured",
  };
}

function cleanFilters(filters: PropertyFilters): PropertyFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as PropertyFilters;
}

function filterLabel(key: string, value: string) {
  const labels: Record<string, string> = {
    search: `Search: ${value}`,
    state: `State: ${value}`,
    city: `City: ${value}`,
    lga: `LGA: ${value}`,
    neighborhood: `Area: ${value}`,
    property_type: `Type: ${value.replaceAll("_", " ")}`,
    listing_type: `Listing: ${value.replaceAll("_", " ")}`,
    min_price: `Min: ${value}`,
    max_price: `Max: ${value}`,
    ordering: `Sort: ${value.replace("-", "").replaceAll("_", " ")}`,
  };
  return labels[key] ?? `${key}: ${value}`;
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map" | "split">("grid");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const activeFilters = Object.entries(cleanFilters(filters)).filter(
    ([key, value]) => !["ordering", "min_lat", "max_lat", "min_lng", "max_lng"].includes(key) && value,
  );
  const propertiesQuery = useQuery({
    queryKey: ["public-properties", filters],
    queryFn: () => getPublicProperties(filters),
  });

  function applyFilters(nextFilters: PropertyFilters) {
    const next = {
      ...nextFilters,
      ordering: nextFilters.ordering || "-featured",
    };
    setFilters(next);

    const params = new URLSearchParams();
    Object.entries(cleanFilters(next)).forEach(([key, value]) => {
      if (key === "ordering" && value === "-featured") {
        return;
      }
      params.set(key, value);
    });
    router.replace(`/properties${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const properties = propertiesQuery.data?.results ?? [];
  const mapReadyCount = properties.filter((property) => property.latitude && property.longitude)
    .length;
  const listingGridClass =
    viewMode === "list" || viewMode === "split"
      ? "grid gap-5"
      : "grid gap-5 md:grid-cols-2 xl:grid-cols-3";

  function viewButton(label: string, nextViewMode: typeof viewMode) {
    return (
      <Button
        className={viewMode === nextViewMode ? "h-10" : "h-10 border-white/20"}
        key={nextViewMode}
        onClick={() => setViewMode(nextViewMode)}
        variant={viewMode === nextViewMode ? "primary" : "secondary"}
      >
        {label}
      </Button>
    );
  }

  function renderListings() {
    if (propertiesQuery.isLoading) {
      return (
        <div className={listingGridClass}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              className={
                viewMode === "list" || viewMode === "split"
                  ? "h-64 animate-pulse rounded-md bg-white/10"
                  : "h-96 animate-pulse rounded-md bg-white/10"
              }
              key={item}
            />
          ))}
        </div>
      );
    }

    if (properties.length === 0) {
      return null;
    }

    return (
      <div className={listingGridClass}>
        {properties.map((property) => (
          <div
            className={
              selectedPropertyId === property.id
                ? "rounded-md ring-2 ring-brand-secondary ring-offset-2 ring-offset-brand-background"
                : "rounded-md"
            }
            id={`property-result-${property.id}`}
            key={property.id}
            onFocus={() => setSelectedPropertyId(property.id)}
            onMouseEnter={() => setSelectedPropertyId(property.id)}
          >
            <PropertyCard property={property} variant={viewMode === "grid" ? "grid" : "list"} />
          </div>
        ))}
      </div>
    );
  }

  function removeFilter(key: keyof PropertyFilters) {
    applyFilters({ ...filters, [key]: "" });
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <main>
        <section className="border-b border-white/10 bg-brand-surface/45">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Browse"
              title="Search Nigerian properties"
              description="Browse approved sale, rent, shortlet, apartment-share, land, and commercial listings before account creation."
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
            <div className="sticky top-28">
              <PropertyFilterPanel filters={filters} onChange={applyFilters} />
            </div>
          </aside>
          {mobileFiltersOpen ? (
            <div
              className="fixed inset-0 z-50 bg-black/70 px-4 py-5 lg:hidden"
              id="mobile-property-filters"
            >
              <div className="ml-auto max-h-full max-w-md overflow-y-auto">
                <div className="mb-3 flex justify-end">
                  <Button onClick={() => setMobileFiltersOpen(false)} variant="secondary">
                    Close filters
                  </Button>
                </div>
                <PropertyFilterPanel
                  filters={filters}
                  onChange={(nextFilters) => {
                    applyFilters(nextFilters);
                    setMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          ) : null}
          <section>
            <div className="mb-5 rounded-md border border-white/10 bg-brand-surface/55 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">
                    {propertiesQuery.data
                      ? `${propertiesQuery.data.count} approved listing${
                          propertiesQuery.data.count === 1 ? "" : "s"
                        }`
                      : "Loading approved listings"}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    Public results only include approved properties.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Property view mode">
                  {viewButton("Grid", "grid")}
                  {viewButton("List", "list")}
                  {viewButton("Map", "map")}
                  <span className="hidden lg:inline-flex">{viewButton("Split", "split")}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-brand-muted">
                {mapReadyCount} listing{mapReadyCount === 1 ? "" : "s"} include public map
                metadata. Pins may be approximate to protect seller privacy.
              </p>
              {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map(([key, value]) => (
                    <button
                      className="rounded-full border border-brand-secondary/40 bg-brand-secondary/10 px-3 py-1 text-xs font-semibold text-brand-secondary"
                      key={key}
                      onClick={() => removeFilter(key as keyof PropertyFilters)}
                      type="button"
                    >
                      {filterLabel(key, value)} x
                    </button>
                  ))}
                  <button
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-brand-muted"
                    onClick={() => applyFilters({ ordering: "-featured" })}
                    type="button"
                  >
                    Clear all
                  </button>
                </div>
              ) : null}
            </div>
            {propertiesQuery.isError ? (
              <Card className="p-6 text-sm text-red-200">Properties could not be loaded.</Card>
            ) : null}
            {propertiesQuery.isLoading ? renderListings() : null}
            {viewMode === "map" && properties.length > 0 && !propertiesQuery.isLoading ? (
              <PropertyMapPanel
                onSelectProperty={(propertyId) => setSelectedPropertyId(propertyId || null)}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
              />
            ) : null}
            {viewMode === "split" && properties.length > 0 && !propertiesQuery.isLoading ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
                <div>{renderListings()}</div>
                <div className="xl:sticky xl:top-28 xl:self-start">
                  <PropertyMapPanel
                    onSelectProperty={(propertyId) => setSelectedPropertyId(propertyId || null)}
                    properties={properties}
                    selectedPropertyId={selectedPropertyId}
                  />
                </div>
              </div>
            ) : null}
            {viewMode !== "map" && viewMode !== "split" && !propertiesQuery.isLoading
              ? renderListings()
              : null}
            {propertiesQuery.data?.results.length === 0 ? (
              <Card className="p-8">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
                  No approved listings match these filters.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
                  Try removing one or two filters, changing the city, or browsing all approved
                  properties while new inventory is reviewed.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => applyFilters({ ordering: "-featured" })}>
                    Clear filters
                  </Button>
                  <Link className={buttonClasses("secondary")} href="/">
                    Back to discovery
                  </Link>
                </div>
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
