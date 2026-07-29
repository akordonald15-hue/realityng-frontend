"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
    onChange({ ordering: "-featured" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters });
  }

  return (
    <Card className="p-4">
      <form className="space-y-4" onSubmit={submit}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-xl font-semibold text-brand-text">Refine search</p>
            <p className="mt-1 text-xs leading-5 text-brand-muted">
              These filters are supported by the current public listings API.
            </p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="property-search">
            Search
          </label>
          <Input
            className="mt-2"
            id="property-search"
            onChange={(event) => update("search", event.target.value)}
            placeholder="Title or keyword"
            value={filters.search ?? ""}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="property-state">
            State
          </label>
          <Input
            className="mt-2"
            id="property-state"
            onChange={(event) => update("state", event.target.value)}
            placeholder="Lagos"
            value={filters.state ?? ""}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="property-city">
            City
          </label>
          <Input
            className="mt-2"
            id="property-city"
            onChange={(event) => update("city", event.target.value)}
            placeholder="Lagos"
            value={filters.city ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-brand-text" htmlFor="property-lga">
              LGA
            </label>
            <Input
              className="mt-2"
              id="property-lga"
              onChange={(event) => update("lga", event.target.value)}
              placeholder="Eti-Osa"
              value={filters.lga ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-text" htmlFor="property-area">
              Area
            </label>
            <Input
              className="mt-2"
              id="property-area"
              onChange={(event) => update("neighborhood", event.target.value)}
              placeholder="Lekki Phase 1"
              value={filters.neighborhood ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="property-type">
            Property type
          </label>
          <Select
            className="mt-2"
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
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="listing-type">
            Listing type
          </label>
          <Select
            className="mt-2"
            id="listing-type"
            onChange={(event) => update("listing_type", event.target.value)}
            value={filters.listing_type ?? ""}
          >
            <option value="">Any listing type</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="apartment_share">Apartment share</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-brand-text" htmlFor="min-price">
              Min price
            </label>
            <Input
              className="mt-2"
              id="min-price"
              min="0"
              onChange={(event) => update("min_price", event.target.value)}
              type="number"
              value={filters.min_price ?? ""}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-text" htmlFor="max-price">
              Max price
            </label>
            <Input
              className="mt-2"
              id="max-price"
              min="0"
              onChange={(event) => update("max_price", event.target.value)}
              type="number"
              value={filters.max_price ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-text" htmlFor="ordering">
            Sort
          </label>
          <Select
            className="mt-2"
            id="ordering"
            onChange={(event) => update("ordering", event.target.value)}
            value={filters.ordering ?? "-featured"}
          >
            <option value="-featured">Featured</option>
            <option value="-created_at">Newest</option>
            <option value="price">Lowest price</option>
            <option value="-price">Highest price</option>
          </Select>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" type="submit">
            Apply
          </Button>
          <Button className="flex-1" onClick={clearFilters} type="button" variant="secondary">
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}
