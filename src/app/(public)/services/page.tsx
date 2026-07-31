"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { EmptyMarketplaceState, MarketplaceSkeleton } from "@/components/services/marketplace-states";
import { ProviderCard } from "@/components/services/provider-card";
import { ServiceSearchBar } from "@/components/services/service-search-bar";
import { TradeCategoryGrid } from "@/components/services/trade-category-grid";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getServiceProviders,
  getTradeCategories,
  type ServiceProviderFilters,
} from "@/lib/api/services";

function filtersFromParams(params: URLSearchParams): ServiceProviderFilters {
  return {
    search: params.get("search") ?? "",
    category: params.get("category") ?? "",
    state: params.get("state") ?? "",
    city: params.get("city") ?? "",
    lga: params.get("lga") ?? "",
    provider_type: (params.get("provider_type") as ServiceProviderFilters["provider_type"]) ?? "",
    ordering: (params.get("ordering") as ServiceProviderFilters["ordering"]) ?? "-created_at",
  };
}

function cleanFilters(filters: ServiceProviderFilters): ServiceProviderFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as ServiceProviderFilters;
}

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [filters, setFilters] = useState<ServiceProviderFilters>(initialFilters);

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: getTradeCategories,
  });
  const providersQuery = useQuery({
    queryKey: ["service-providers", filters],
    queryFn: () => getServiceProviders(filters),
  });

  function applyFilters(nextFilters: ServiceProviderFilters) {
    const next = {
      ...nextFilters,
      ordering: nextFilters.ordering || "-created_at",
    };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(cleanFilters(next)).forEach(([key, value]) => {
      if (key === "ordering" && value === "-created_at") {
        return;
      }
      params.set(key, value);
    });
    router.replace(`/services${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const categories = categoriesQuery.data ?? [];
  const providers = providersQuery.data?.results ?? [];

  return (
    <main className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <section className="border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_34rem] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-brand-secondary">
              Verified services marketplace
            </p>
            <h1 className="mt-5 font-heading text-4xl font-semibold sm:text-5xl">
              Find trusted property services in Nigeria.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-muted">
              Browse approved artisans and service companies for property maintenance,
              relocation, utilities, cleaning, and construction support.
            </p>
          </div>
          <Card className="p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-secondary">
              Foundation release
            </p>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              Quote requests, bookings, portfolio uploads, and verified reviews are intentionally
              staged for later Sprint 9 phases. Public discovery starts here.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ServiceSearchBar
            categories={categories}
            initialFilters={filters}
            onSearch={applyFilters}
          />
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Browse by trade"
            title="Start with the service category you need."
            description="Categories are loaded from the backend so RealityNG can expand the marketplace without hardcoded frontend lists."
          />
          <div className="mt-8">
            {categoriesQuery.isLoading ? (
              <MarketplaceSkeleton />
            ) : categories.length > 0 ? (
              <TradeCategoryGrid categories={categories} />
            ) : (
              <EmptyMarketplaceState
                title="No service categories yet"
                description="Active service categories will appear here after admin setup."
              />
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Approved providers"
            title="Public profiles built around verification and location."
            description="Only approved, active, public providers appear in this marketplace foundation."
          />
          <div className="mt-8">
            {providersQuery.isLoading ? (
              <MarketplaceSkeleton />
            ) : providers.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <EmptyMarketplaceState />
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}
