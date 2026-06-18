"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { propertyTypeOptions, type PropertyFilters } from "@/lib/api/properties";

type PropertyFilterPanelProps = {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
};

export function PropertyFilterPanel({ filters, onChange }: PropertyFilterPanelProps) {
  function update(field: keyof PropertyFilters, value: string) {
    onChange({ ...filters, [field]: value });
  }

  function clearFilters() {
    onChange({ ordering: "-created_at" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters });
  }

  const inputClass =
    "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

  return (
    <form className="space-y-4 rounded-md border border-slate-200 bg-white p-4" onSubmit={submit}>
      <div>
        <label className="text-sm font-medium text-ink" htmlFor="property-search">
          Search
        </label>
        <input
          className={inputClass}
          id="property-search"
          onChange={(event) => update("search", event.target.value)}
          placeholder="Title"
          value={filters.search ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="property-city">
            City
          </label>
          <input
            className={inputClass}
            id="property-city"
            onChange={(event) => update("city", event.target.value)}
            placeholder="Lagos"
            value={filters.city ?? ""}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="property-type">
            Property type
          </label>
          <select
            className={inputClass}
            id="property-type"
            onChange={(event) => update("property_type", event.target.value)}
            value={filters.property_type ?? ""}
          >
            <option value="">Any type</option>
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="listing-type">
            Listing type
          </label>
          <select
            className={inputClass}
            id="listing-type"
            onChange={(event) => update("listing_type", event.target.value)}
            value={filters.listing_type ?? ""}
          >
            <option value="">Sale or rent</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="min-price">
              Min price
            </label>
            <input
              className={inputClass}
              id="min-price"
              min="0"
              onChange={(event) => update("min_price", event.target.value)}
              type="number"
              value={filters.min_price ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink" htmlFor="max-price">
              Max price
            </label>
            <input
              className={inputClass}
              id="max-price"
              min="0"
              onChange={(event) => update("max_price", event.target.value)}
              type="number"
              value={filters.max_price ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink" htmlFor="ordering">
            Sort
          </label>
          <select
            className={inputClass}
            id="ordering"
            onChange={(event) => update("ordering", event.target.value)}
            value={filters.ordering ?? "-created_at"}
          >
            <option value="-created_at">Newest</option>
            <option value="price">Lowest price</option>
            <option value="-price">Highest price</option>
            <option value="-featured">Featured</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit">Apply</Button>
        <Button onClick={clearFilters} type="button" variant="secondary">
          Clear
        </Button>
      </div>
    </form>
  );
}
