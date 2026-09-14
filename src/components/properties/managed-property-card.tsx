"use client";

import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { Property, PropertyStatus } from "@/lib/api/properties";
import { formatListingType, formatPrice, formatPropertyType } from "@/lib/properties/format";

export const propertyStatusPresentation: Record<
  PropertyStatus,
  { label: string; tone: "approved" | "pending" | "rejected" | "neutral" }
> = {
  approved: { label: "Active", tone: "approved" },
  pending_review: { label: "Pending review", tone: "pending" },
  draft: { label: "Draft", tone: "neutral" },
  rejected: { label: "Rejected", tone: "rejected" },
  archived: { label: "Archived", tone: "neutral" },
};

export function ManagedPropertyCard({
  editHref,
  property,
}: {
  editHref?: string;
  property: Property;
}) {
  const status = property.status ? propertyStatusPresentation[property.status] : undefined;
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ");
  const facts = [
    property.bedrooms ? `${property.bedrooms} bed${property.bedrooms === 1 ? "" : "s"}` : null,
    property.bathrooms ? `${property.bathrooms} bath${property.bathrooms === 1 ? "" : "s"}` : null,
    property.parking_spaces ? `${property.parking_spaces} parking` : null,
    property.floor_area ? `${property.floor_area} sqft` : null,
  ].filter(Boolean);
  const canViewPublic = property.status === "approved";

  return (
    <Card
      className="group overflow-hidden rounded-[28px] border-reality-border-secondary bg-white shadow-reality-xs transition duration-200 hover:-translate-y-0.5 hover:border-reality-brand-300 hover:shadow-reality-sm"
      variant="realityElevated"
    >
      <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-reality-bg-muted">
          {property.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              src={property.cover_image_url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-reality-bg-muted text-sm font-semibold text-reality-text-tertiary">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold leading-7 text-reality-text-primary">
                {property.title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-reality-text-secondary">
                {location || property.address || "Location not supplied"}
              </p>
            </div>
            {status ? <StatusChip tone={status.tone}>{status.label}</StatusChip> : null}
          </div>

          <p className="mt-4 text-2xl font-semibold leading-8 text-reality-text-primary">
            {formatPrice(property)}
          </p>
          <p className="mt-2 text-sm leading-5 text-reality-text-secondary">
            {formatListingType(property.listing_type)} · {formatPropertyType(property.property_type)}
          </p>
          {facts.length > 0 ? (
            <p className="mt-2 text-sm leading-5 text-reality-text-secondary">{facts.join(" · ")}</p>
          ) : null}
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-reality-text-tertiary">
            Added {new Date(property.created_at).toLocaleDateString()}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {canViewPublic ? (
              <Link
                className={buttonClasses("reality", "h-10 px-5")}
                href={`/properties/${property.slug}`}
              >
                View listing
              </Link>
            ) : null}
            {editHref ? (
              <Link className={buttonClasses("realitySecondary", "h-10 px-5")} href={editHref}>
                {property.status === "draft" ? "Continue draft" : "Edit"}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

