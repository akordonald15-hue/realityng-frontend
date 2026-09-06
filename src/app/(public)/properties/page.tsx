"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

import { PropertyMapPanel } from "@/components/maps/property-map-panel";
import { PropertyCard } from "@/components/properties/property-card";
import { PublicShell } from "@/components/layout/public-shell";
import { StaggerReveal } from "@/components/motion/stagger-reveal";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListboxSelect } from "@/components/ui/listbox-select";
import {
  getPublicProperties,
  propertyTypeOptions,
  type PropertyFilters,
} from "@/lib/api/properties";

type ViewMode = "grid" | "map";

const defaultOrdering = "-featured";

const listingTypeOptions = [
  { label: "Any listing", value: "" },
  { label: "For rent", value: "rent" },
  { label: "For sale", value: "sale" },
  { label: "Shortlet", value: "shortlet" },
  { label: "Apartment share", value: "apartment_share" },
];

const priceOptions = [
  { label: "Any price", value: "" },
  { label: "Up to ₦1m", value: "1000000" },
  { label: "Up to ₦2.5m", value: "2500000" },
  { label: "Up to ₦5m", value: "5000000" },
  { label: "Up to ₦10m", value: "10000000" },
  { label: "Up to ₦25m", value: "25000000" },
  { label: "Up to ₦50m", value: "50000000" },
];

const sortOptions = [
  { label: "Featured first", value: "-featured" },
  { label: "Newest first", value: "-created_at" },
  { label: "Lowest price", value: "price" },
  { label: "Highest price", value: "-price" },
];

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
    ordering: params.get("ordering") ?? defaultOrdering,
  };
}

function viewFromParams(params: URLSearchParams): ViewMode {
  return params.get("view") === "map" ? "map" : "grid";
}

function cleanFilters(filters: PropertyFilters): PropertyFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as PropertyFilters;
}

function propertyTypeSelectOptions() {
  return [
    { label: "Any type", value: "" },
    ...propertyTypeOptions.map((option) => ({ label: option.label, value: option.value })),
  ];
}

function filterLabel(key: string, value: string) {
  const labels: Record<string, string> = {
    search: `Search: ${value}`,
    state: `State: ${value}`,
    city: `Location: ${value}`,
    lga: `LGA: ${value}`,
    neighborhood: `Area: ${value}`,
    property_type: `Type: ${value.replaceAll("_", " ")}`,
    listing_type: `Listing: ${value.replaceAll("_", " ")}`,
    min_price: `Min: ₦${Number(value).toLocaleString("en-NG")}`,
    max_price: `Up to ₦${Number(value).toLocaleString("en-NG")}`,
    ordering: `Sort: ${value.replace("-", "").replaceAll("_", " ")}`,
  };
  return labels[key] ?? `${key}: ${value}`;
}

function resultCountLabel(count?: number) {
  if (count === undefined) {
    return "Loading properties";
  }
  return `${count} ${count === 1 ? "property" : "properties"} found`;
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const urlFilters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParamString)),
    [searchParamString],
  );
  const viewMode = useMemo(
    () => viewFromParams(new URLSearchParams(searchParamString)),
    [searchParamString],
  );
  const [draftFilters, setDraftFilters] = useState<PropertyFilters>(urlFilters);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    setDraftFilters(urlFilters);
  }, [urlFilters]);

  const queryFilters = useMemo(() => {
    return cleanFilters({
      ...urlFilters,
      ordering: urlFilters.ordering || defaultOrdering,
    });
  }, [urlFilters]);

  const activeFilters = Object.entries(cleanFilters(urlFilters)).filter(
    ([key, value]) =>
      !["ordering", "min_lat", "max_lat", "min_lng", "max_lng"].includes(key) && value,
  );

  const propertiesQuery = useQuery({
    queryKey: ["public-properties", queryFilters],
    queryFn: () => getPublicProperties(queryFilters),
  });

  const properties = propertiesQuery.data?.results ?? [];
  const mapReadyCount = properties.filter(
    (property) => property.latitude && property.longitude,
  ).length;

  function replaceRoute(nextFilters: PropertyFilters, nextViewMode: ViewMode = viewMode) {
    const params = new URLSearchParams();
    Object.entries(
      cleanFilters({ ...nextFilters, ordering: nextFilters.ordering || defaultOrdering }),
    ).forEach(([key, value]) => {
      if (key === "ordering" && value === defaultOrdering) {
        return;
      }
      params.set(key, value);
    });
    if (nextViewMode === "map") {
      params.set("view", "map");
    }
    router.replace(`/properties${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  function applySearch() {
    replaceRoute({
      ...urlFilters,
      city: draftFilters.city ?? "",
      listing_type: draftFilters.listing_type ?? "",
      property_type: draftFilters.property_type ?? "",
      max_price: draftFilters.max_price ?? "",
      ordering: draftFilters.ordering || defaultOrdering,
    });
  }

  function updateDraft(key: keyof PropertyFilters, value: string) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function removeFilter(key: keyof PropertyFilters) {
    replaceRoute({ ...urlFilters, [key]: "" });
  }

  function clearFilters() {
    replaceRoute({ ordering: defaultOrdering }, "grid");
  }

  function changeView(nextViewMode: ViewMode) {
    replaceRoute(urlFilters, nextViewMode);
  }

  function renderListings(compact = false) {
    if (propertiesQuery.isLoading) {
      return (
        <div
          className={clsx(
            "grid gap-6",
            compact ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, compact ? 4 : 8).map((item) => (
            <div
              className="h-[386px] w-full animate-pulse rounded-[2rem] bg-reality-bg-muted md:w-[314px]"
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
      <StaggerReveal
        className={clsx(
          "grid gap-x-6 gap-y-10",
          compact ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4",
        )}
        stagger={0.035}
        y={12}
      >
        {properties.map((property) => (
          <div
            className={clsx(
              "rounded-[2rem]",
              selectedPropertyId === property.id &&
                "ring-2 ring-reality-brand-500/45 ring-offset-2 ring-offset-white",
            )}
            data-motion-child
            id={`property-result-${property.id}`}
            key={property.id}
            onFocus={() => setSelectedPropertyId(property.id)}
          >
            <PropertyCard className="w-full md:w-[314px]" property={property} variant="reality" />
          </div>
        ))}
      </StaggerReveal>
    );
  }

  return (
    <PublicShell variant="reality">
      <main className="bg-white text-reality-text-primary">
        <section className="mx-auto max-w-reality-wide px-4 pb-12 pt-24 text-center sm:px-6 md:pb-16 md:pt-44">
          <h1 className="font-display text-[30px] font-medium leading-tight tracking-normal text-black md:text-7xl">
            Explore Properties
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-reality-text-muted md:text-lg">
            Search verified homes, shortlets, land, and commercial spaces.
          </p>
        </section>

        <section className="mx-auto max-w-reality-wide px-4 pb-20 sm:px-6">
          <div className="reality-reveal mb-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,299px)_174px_174px_174px_auto] xl:items-end">
              <label className="grid gap-2 text-left text-sm font-medium text-reality-text-primary">
                <span>Location</span>
                <Input
                  onChange={(event) => updateDraft("city", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applySearch();
                    }
                  }}
                  placeholder="Where"
                  value={draftFilters.city ?? ""}
                  variant="reality"
                />
              </label>
              <label className="grid gap-2 text-left text-sm font-medium text-reality-text-primary">
                <span>Type</span>
                <ListboxSelect
                  aria-label="Property type"
                  onChange={(value) => updateDraft("property_type", value)}
                  options={propertyTypeSelectOptions()}
                  value={draftFilters.property_type ?? ""}
                  variant="reality"
                />
              </label>
              <label className="grid gap-2 text-left text-sm font-medium text-reality-text-primary">
                <span>Listing</span>
                <ListboxSelect
                  aria-label="Listing type"
                  onChange={(value) => updateDraft("listing_type", value)}
                  options={listingTypeOptions}
                  value={draftFilters.listing_type ?? ""}
                  variant="reality"
                />
              </label>
              <label className="grid gap-2 text-left text-sm font-medium text-reality-text-primary">
                <span>Price range</span>
                <ListboxSelect
                  aria-label="Maximum price"
                  onChange={(value) => updateDraft("max_price", value)}
                  options={priceOptions}
                  value={draftFilters.max_price ?? ""}
                  variant="reality"
                />
              </label>
              <Button className="h-14 rounded-full px-7 md:col-span-2 xl:col-span-1" onClick={applySearch} variant="reality">
                Search
              </Button>
            </div>

            <div
              aria-label="Property view"
              className="hidden shrink-0 rounded-full border border-reality-border-secondary bg-white p-1 shadow-reality-xs xl:flex"
              role="group"
            >
              <button
                aria-pressed={viewMode === "grid"}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "text-reality-text-muted hover:bg-reality-bg-muted hover:text-black",
                )}
                onClick={() => changeView("grid")}
                type="button"
              >
                Grid
              </button>
              <button
                aria-pressed={viewMode === "map"}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                  viewMode === "map"
                    ? "bg-black text-white"
                    : "text-reality-text-muted hover:bg-reality-bg-muted hover:text-black",
                )}
                onClick={() => changeView("map")}
                type="button"
              >
                Map
              </button>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-medium text-black">
                {resultCountLabel(propertiesQuery.data?.count)}
              </p>
              <p className="mt-1 text-sm text-reality-text-muted">
                {mapReadyCount} listing{mapReadyCount === 1 ? "" : "s"} include public map data.
              </p>
            </div>
            <label className="grid gap-2 text-left text-sm font-medium text-reality-text-primary md:w-48">
              <span>Sort</span>
              <ListboxSelect
                aria-label="Sort properties"
                onChange={(value) => replaceRoute({ ...urlFilters, ordering: value || defaultOrdering })}
                options={sortOptions}
                value={urlFilters.ordering || defaultOrdering}
                variant="reality"
              />
            </label>
          </div>

          {activeFilters.length > 0 ? (
            <div className="mb-8 flex flex-wrap gap-2">
              {activeFilters.map(([key, value]) => (
                <button
                  className="rounded-full border border-reality-border-secondary bg-reality-bg-muted px-3 py-1.5 text-sm font-medium capitalize text-reality-text-primary transition hover:border-reality-brand-500"
                  key={key}
                  onClick={() => removeFilter(key as keyof PropertyFilters)}
                  type="button"
                >
                  {filterLabel(key, value)} x
                </button>
              ))}
              <button
                className="rounded-full border border-reality-border-secondary px-3 py-1.5 text-sm font-medium text-reality-text-muted transition hover:text-black"
                onClick={clearFilters}
                type="button"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {propertiesQuery.isError ? (
            <Card className="mb-8 rounded-[2rem] border-reality-border-secondary bg-reality-bg-muted p-6 text-sm text-red-700">
              Properties could not be loaded.
              <Button
                className="mt-4"
                onClick={() => void propertiesQuery.refetch()}
                variant="realitySecondary"
              >
                Try again
              </Button>
            </Card>
          ) : null}

          {viewMode === "map" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,652px)_minmax(420px,1fr)]">
              <div>{renderListings(true)}</div>
              <div className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
                <PropertyMapPanel
                  onSelectProperty={(propertyId) => setSelectedPropertyId(propertyId || null)}
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  variant="reality"
                />
              </div>
            </div>
          ) : (
            renderListings()
          )}

          {propertiesQuery.data?.results.length === 0 ? (
            <Card className="rounded-[2rem] border-reality-border-secondary bg-reality-bg-muted p-8 text-center">
              <h2 className="font-display text-3xl font-medium text-black">No properties found</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-reality-text-muted">
                Try removing a filter, changing the location, or browsing all verified listings.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={clearFilters} variant="reality">
                  Clear filters
                </Button>
                <Link className={buttonClasses("realitySecondary")} href="/">
                  Back home
                </Link>
              </div>
            </Card>
          ) : null}
        </section>
      </main>
    </PublicShell>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white px-6 py-10 text-reality-text-muted [color-scheme:light]">
          <div className="mx-auto max-w-reality-wide">
            <div className="h-10 w-56 animate-pulse rounded-[16px] bg-reality-bg-muted" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  className="h-[386px] animate-pulse rounded-[32px] bg-reality-bg-muted"
                  key={item}
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
