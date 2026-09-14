"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ProviderType, ServiceProviderFilters, TradeCategory } from "@/lib/api/services";

type ServiceSearchBarProps = {
  categories: TradeCategory[];
  initialFilters?: ServiceProviderFilters;
  onSearch: (filters: ServiceProviderFilters) => void;
};

function childCategories(categories: TradeCategory[]) {
  return categories.flatMap((category) => category.children);
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M8.25 14.25a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12.5 12.5 16 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ServiceSearchBar({
  categories,
  initialFilters = {},
  onSearch,
}: ServiceSearchBarProps) {
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [category, setCategory] = useState(initialFilters.category ?? "");
  const [state, setState] = useState(initialFilters.state ?? "");
  const city = initialFilters.city ?? "";
  const lga = initialFilters.lga ?? "";
  const providerType = initialFilters.provider_type ?? "";
  const ordering = initialFilters.ordering ?? "-created_at";

  return (
    <form
      className="grid gap-3 rounded-[28px] border border-reality-border-secondary bg-white p-3 text-reality-text-primary shadow-reality-sm md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({
          search,
          category,
          state,
          city,
          lga,
          provider_type: providerType,
          ordering,
        });
      }}
    >
      <label className="grid gap-2 text-sm font-semibold">
        Location
        <input
          className="h-12 rounded-[14px] border border-reality-border-secondary bg-reality-bg-subtle px-4 text-sm outline-none transition focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
          onChange={(event) => setState(event.target.value)}
          placeholder="Where"
          value={state}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Services
        <select
          className="h-12 rounded-[14px] border border-reality-border-secondary bg-reality-bg-subtle px-4 text-sm outline-none transition focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">All services</option>
          {childCategories(categories).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Keyword
        <input
          className="h-12 rounded-[14px] border border-reality-border-secondary bg-reality-bg-subtle px-4 text-sm outline-none transition focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Electrician, cleaning, solar..."
          value={search}
        />
      </label>
      <input name="city" type="hidden" value={city} readOnly />
      <input name="lga" type="hidden" value={lga} readOnly />
      <input name="provider_type" type="hidden" value={providerType} readOnly />
      <input name="ordering" type="hidden" value={ordering ?? "-created_at"} readOnly />
      <Button className="h-12 gap-2 self-end rounded-full px-6" type="submit" variant="reality">
        <SearchIcon />
        Search
      </Button>
    </form>
  );
}

