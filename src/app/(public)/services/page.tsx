"use client";

import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PageContainer } from "@/components/layout/page-container";
import { PublicShell } from "@/components/layout/public-shell";
import { EmptyMarketplaceState, MarketplaceSkeleton } from "@/components/services/marketplace-states";
import { ProviderCard } from "@/components/services/provider-card";
import { ServiceSearchBar } from "@/components/services/service-search-bar";
import { TradeCategoryGrid } from "@/components/services/trade-category-grid";
import { buttonClasses } from "@/components/ui/button";
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
    <PublicShell variant="reality">
      <main className="bg-white text-reality-text-primary">
      <section className="pt-14 sm:pt-20">
        <PageContainer>
          <p className="text-sm text-reality-text-secondary">Find professional artisans around you</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold tracking-normal text-reality-text-primary sm:text-6xl">
            Discover Artisans
          </h1>
          <div className="mt-12 max-w-3xl">
            <ServiceSearchBar
              categories={categories}
              initialFilters={filters}
              onSearch={applyFilters}
            />
          </div>
        </PageContainer>
      </section>

      <section className="py-12">
        <PageContainer>
          <SectionHeader
            eyebrow="Browse by trade"
            title="Start with the service category you need."
            description="Categories are loaded from the backend so RealityNG can expand the marketplace without hardcoded frontend lists."
            variant="reality"
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
        </PageContainer>
      </section>

      <section className="py-12">
        <PageContainer>
          <SectionHeader
            eyebrow="Approved providers"
            title="Public profiles built around verification and location."
            description="Only approved, active, public providers appear in this marketplace foundation."
            variant="reality"
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
        </PageContainer>
      </section>

      <section className="py-14">
        <PageContainer>
          <div className="relative overflow-hidden rounded-[32px] bg-reality-brand-700 px-8 py-12 text-white sm:px-14 lg:min-h-[360px]">
            <Image
              alt=""
              className="object-cover opacity-55"
              fill
              sizes="(min-width: 1024px) 1328px, 100vw"
              src="/home/cta-businessman.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-reality-brand-700 via-reality-brand-600/85 to-reality-brand-500/20" />
            <div className="relative max-w-md">
              <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Ready to get started as a Professional
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/85">
                Create an account to save properties, book viewings, and keep track of the ones
                you&apos;re interested in.
              </p>
              <ProtectedActionLink
                actionLabel="Become an artisan"
                className={buttonClasses("realitySecondary", "mt-7 h-10 px-5")}
                href="/dashboard/artisan/profile"
                role="artisan"
              >
                Get Started
              </ProtectedActionLink>
            </div>
          </div>
        </PageContainer>
      </section>
      </main>
    </PublicShell>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <ServicesContent />
    </Suspense>
  );
}

