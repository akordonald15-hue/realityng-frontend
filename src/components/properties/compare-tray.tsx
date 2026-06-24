"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MAX_COMPARE_PROPERTIES, useCompare } from "@/providers/compare-provider";

export function CompareTray() {
  const { clearProperties, properties, removeProperty } = useCompare();

  if (properties.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Selected properties for comparison"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-secondary/40 bg-brand-background/95 shadow-[0_-12px_36px_rgba(0,0,0,0.35)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold text-brand-text">
              Compare properties{" "}
              <span className="text-brand-secondary">
                {properties.length}/{MAX_COMPARE_PROPERTIES}
              </span>
            </p>
            <Button className="h-8 px-2 lg:hidden" onClick={clearProperties} variant="ghost">
              Clear
            </Button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {properties.map((property) => (
              <div
                className="flex min-w-56 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2"
                key={property.id}
              >
                <Link
                  className="truncate text-sm text-brand-muted hover:text-brand-text"
                  href={`/properties/${property.slug}`}
                >
                  {property.title}
                </Link>
                <button
                  aria-label={`Remove ${property.title} from comparison`}
                  className="text-lg leading-none text-brand-muted hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                  onClick={() => removeProperty(property.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 lg:w-72">
          <Button className="hidden lg:inline-flex" onClick={clearProperties} variant="ghost">
            Clear
          </Button>
          <Button
            aria-describedby="comparison-foundation-note"
            className="flex-1"
            disabled={properties.length < 2}
          >
            {properties.length < 2 ? "Select one more" : "Ready to compare"}
          </Button>
        </div>
        <p className="sr-only" id="comparison-foundation-note">
          Full side-by-side comparison will be added in a future sprint.
        </p>
      </div>
    </aside>
  );
}
