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

export function ServiceSearchBar({
  categories,
  initialFilters = {},
  onSearch,
}: ServiceSearchBarProps) {
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [category, setCategory] = useState(initialFilters.category ?? "");
  const [state, setState] = useState(initialFilters.state ?? "");
  const [city, setCity] = useState(initialFilters.city ?? "");
  const [lga, setLga] = useState(initialFilters.lga ?? "");
  const [providerType, setProviderType] = useState<ProviderType | "">(
    initialFilters.provider_type ?? "",
  );
  const [ordering, setOrdering] = useState<ServiceProviderFilters["ordering"]>(
    initialFilters.ordering ?? "-created_at",
  );

  return (
    <form
      className="grid gap-3 rounded-md border border-white/10 bg-white p-4 text-brand-background shadow-glow md:grid-cols-2 xl:grid-cols-6"
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
      <label className="grid gap-2 text-sm font-semibold xl:col-span-2">
        Keyword
        <input
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Electrician, cleaning, solar..."
          value={search}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Category
        <select
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">Any trade</option>
          {childCategories(categories).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        State
        <input
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setState(event.target.value)}
          placeholder="Lagos"
          value={state}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        City
        <input
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Lagos"
          value={city}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        LGA
        <input
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setLga(event.target.value)}
          placeholder="Eti-Osa"
          value={lga}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Provider type
        <select
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) => setProviderType(event.target.value as ProviderType | "")}
          value={providerType}
        >
          <option value="">Any provider</option>
          <option value="individual">Individual</option>
          <option value="company">Company</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Sort
        <select
          className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand-secondary"
          onChange={(event) =>
            setOrdering(event.target.value as ServiceProviderFilters["ordering"])
          }
          value={ordering}
        >
          <option value="-created_at">Newest</option>
          <option value="-average_rating">Highest rated</option>
          <option value="business_name">Alphabetical</option>
        </select>
      </label>
      <Button className="md:col-span-2 xl:col-span-6" type="submit">
        Search services
      </Button>
    </form>
  );
}
