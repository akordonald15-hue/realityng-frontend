"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { ManagedPropertyCard } from "@/components/properties/managed-property-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  listManagedProperties,
  propertyTypeOptions,
  type ListingType,
  type PropertyFilters,
  type PropertyStatus,
} from "@/lib/api/properties";
import { isApprovedSupplyUser } from "@/lib/auth/permissions";
import { useAuth } from "@/providers/auth-provider";

const statusTabs: Array<{ label: string; value: PropertyStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "approved" },
  { label: "Pending", value: "pending_review" },
  { label: "Draft", value: "draft" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
];

const listingTypeOptions: Array<{ label: string; value: ListingType }> = [
  { label: "For rent", value: "rent" },
  { label: "For sale", value: "sale" },
  { label: "Apartment share", value: "apartment_share" },
];

const orderingOptions = [
  { label: "Newest first", value: "-created_at" },
  { label: "Oldest first", value: "created_at" },
  { label: "Price: low to high", value: "price" },
  { label: "Price: high to low", value: "-price" },
  { label: "Title A-Z", value: "title" },
];

function filterParams(searchParams: URLSearchParams): PropertyFilters {
  return {
    status: (searchParams.get("status") as PropertyStatus | null) ?? undefined,
    search: searchParams.get("search") ?? undefined,
    property_type: searchParams.get("property_type") ?? undefined,
    listing_type: searchParams.get("listing_type") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    ordering: searchParams.get("ordering") ?? "-created_at",
    page: searchParams.get("page") ?? undefined,
  };
}

function ManagementSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <Card
          className="h-[252px] animate-pulse rounded-[28px] border-reality-border-secondary bg-reality-bg-subtle"
          key={item}
          variant="realityElevated"
        />
      ))}
    </div>
  );
}

export default function ManagedPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const filters = filterParams(searchParams);
  const isAllowed = isApprovedSupplyUser(user);
  const currentStatus = (searchParams.get("status") as PropertyStatus | null) ?? "all";

  const propertiesQuery = useQuery({
    enabled: isAllowed,
    queryKey: ["managed-properties", user?.id, searchParams.toString()],
    queryFn: () => listManagedProperties(filters),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== "page") {
      next.delete("page");
    }
    router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`);
  }

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-white py-10 text-reality-text-primary [color-scheme:light]">
        <PageContainer>
          <Card className="p-8" variant="realityElevated">
            <h1 className="text-2xl font-semibold">My Properties</h1>
            <p className="mt-3 text-reality-text-secondary">
              This workspace is available to approved agents and landlords.
            </p>
            <Link className={buttonClasses("realitySecondary", "mt-6 h-10 px-5")} href="/dashboard">
              Back to dashboard
            </Link>
          </Card>
        </PageContainer>
      </main>
    );
  }

  const properties = propertiesQuery.data?.results ?? [];
  const hasSearch = Boolean(filters.search || filters.property_type || filters.listing_type || filters.city);
  const hasStatus = currentStatus !== "all";
  const isEmpty = !propertiesQuery.isLoading && !propertiesQuery.isError && properties.length === 0;
  const emptyCopy = hasSearch
    ? "No properties match your search or filters."
    : hasStatus
      ? `No ${statusTabs.find((item) => item.value === currentStatus)?.label.toLowerCase()} properties yet.`
      : "You haven't added or been assigned any properties yet.";

  return (
    <main
      className="min-h-screen bg-white pb-20 pt-8 text-reality-text-primary [color-scheme:light] lg:pt-10"
    >
      <PageContainer>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-reality-text-tertiary"
        >
          <Link className="transition hover:text-reality-brand-700" href="/dashboard">
            Dashboard
          </Link>
          <span>/</span>
          <span aria-current="page" className="text-reality-text-secondary">
            My Properties
          </span>
        </nav>

        <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-medium leading-[44px] text-reality-text-primary">
              My Properties
            </h1>
            <p className="mt-2 text-lg leading-7 text-reality-text-secondary">
              Manage properties you own or represent.
            </p>
          </div>
          <Link className={buttonClasses("reality", "h-11 px-6")} href="/properties/new">
            Add Property
          </Link>
        </header>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2" role="tablist" aria-label="Property status filters">
            {statusTabs.map((tab) => {
              const selected = currentStatus === tab.value;
              return (
                <button
                  aria-selected={selected}
                  className={`h-10 rounded-full px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 ${
                    selected
                      ? "bg-reality-brand-500 text-white shadow-reality-xs"
                      : "border border-reality-border-secondary bg-white text-reality-text-secondary hover:bg-reality-bg-subtle"
                  }`}
                  key={tab.value}
                  onClick={() => updateParam("status", tab.value === "all" ? "" : tab.value)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <Card
          className="mt-6 grid gap-4 rounded-[28px] p-4 md:grid-cols-2 xl:grid-cols-4"
          variant="realityElevated"
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-reality-text-secondary">Search by title</span>
            <Input
              defaultValue={filters.search ?? ""}
              onBlur={(event) => updateParam("search", event.target.value.trim())}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParam("search", event.currentTarget.value.trim());
                }
              }}
              placeholder="Search properties..."
              variant="reality"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-reality-text-secondary">Type</span>
            <Select
              onChange={(event) => updateParam("property_type", event.target.value)}
              value={filters.property_type ?? ""}
              variant="reality"
            >
              <option value="">Any type</option>
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-reality-text-secondary">Listing</span>
            <Select
              onChange={(event) => updateParam("listing_type", event.target.value)}
              value={filters.listing_type ?? ""}
              variant="reality"
            >
              <option value="">Any listing</option>
              {listingTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-reality-text-secondary">Sort</span>
            <Select
              onChange={(event) => updateParam("ordering", event.target.value)}
              value={filters.ordering ?? "-created_at"}
              variant="reality"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-reality-text-secondary">
          <p>{propertiesQuery.data ? `${propertiesQuery.data.count} properties` : "Loading properties"}</p>
          {hasSearch || hasStatus ? (
            <Button variant="realityGhost" onClick={() => router.push(pathname)}>
              Clear filters
            </Button>
          ) : null}
        </div>

        <section className="mt-6">
          {propertiesQuery.isLoading ? <ManagementSkeleton /> : null}
          {propertiesQuery.isError ? (
            <Card className="p-8" variant="realityElevated">
              <FormMessage tone="error" variant="reality">
                Properties could not be loaded. Please try again.
              </FormMessage>
              <Button className="mt-5" onClick={() => propertiesQuery.refetch()} variant="reality">
                Retry
              </Button>
            </Card>
          ) : null}
          {isEmpty ? (
            <Card className="p-8 text-center" variant="realityElevated">
              <h2 className="text-2xl font-semibold text-reality-text-primary">{emptyCopy}</h2>
              {!hasSearch && !hasStatus ? (
                <Link className={buttonClasses("reality", "mt-6 h-11 px-6")} href="/properties/new">
                  Add your first property
                </Link>
              ) : null}
            </Card>
          ) : null}
          {properties.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {properties.map((property) => (
                <ManagedPropertyCard
                  editHref={
                    property.can_manage_listing
                      ? `/dashboard/properties/${property.slug}/edit`
                      : undefined
                  }
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          ) : null}
        </section>

        {propertiesQuery.data && (propertiesQuery.data.previous || propertiesQuery.data.next) ? (
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              disabled={!propertiesQuery.data.previous}
              onClick={() =>
                updateParam("page", String(Math.max(Number(params.get("page") ?? 1) - 1, 1)))
              }
              variant="realitySecondary"
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-reality-text-secondary">
              Page {Number(params.get("page") ?? 1)}
            </span>
            <Button
              disabled={!propertiesQuery.data.next}
              onClick={() => updateParam("page", String(Number(params.get("page") ?? 1) + 1))}
              variant="realitySecondary"
            >
              Next
            </Button>
          </div>
        ) : null}
      </PageContainer>
    </main>
  );
}

