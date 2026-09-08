import Link from "next/link";
import { clsx } from "clsx";

import { CompareButton } from "@/components/properties/compare-button";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Property } from "@/lib/api/properties";
import {
  formatListingType,
  formatPrice,
  formatPropertyType,
  propertySize,
} from "@/lib/properties/format";

type PropertyCardProps = {
  property: Property;
  variant?: "grid" | "list" | "reality";
  className?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function propertyFacts(property: Property) {
  return [
    property.bedrooms !== undefined && property.bedrooms !== null
      ? `${property.bedrooms} bed${property.bedrooms === 1 ? "" : "s"}`
      : null,
    property.bathrooms !== undefined && property.bathrooms !== null
      ? `${property.bathrooms} bath${property.bathrooms === 1 ? "" : "s"}`
      : null,
    property.parking_spaces !== undefined && property.parking_spaces !== null
      ? `${property.parking_spaces} parking`
      : null,
    propertySize(property) !== "N/A" ? propertySize(property) : null,
  ].filter(Boolean);
}

export function PropertyCard({ property, variant = "grid", className }: PropertyCardProps) {
  const facts = propertyFacts(property);
  const imageCount = property.image_count ?? property.image_gallery?.length ?? 0;

  if (variant === "reality") {
    return (
      <article className={clsx("reality-card-hover group relative w-[314px] shrink-0", className)}>
        <Link
          aria-label={`View ${property.title}`}
          className="absolute inset-0 z-10 rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-4"
          href={`/properties/${property.slug}`}
        />
        <div className="relative h-[286px] overflow-hidden rounded-[2rem] bg-reality-bg-muted">
          {property.cover_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={property.title}
              className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
              decoding="async"
              loading="lazy"
              src={property.cover_image_url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eefaf5,#d9f5ea)] px-8 text-center font-display text-3xl font-semibold text-reality-brand-700">
              RealityNG
            </div>
          )}
          <div className="absolute right-4 top-4 z-20 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-black/70 backdrop-blur">
            {formatPropertyType(property.property_type)}
          </div>
          <div className="absolute left-4 top-4 z-20">
            <FavoriteButton
              compact
              initialFavorited={property.is_favorited}
              propertyId={property.id}
              propertySlug={property.slug}
              variant="reality"
            />
          </div>
          {imageCount > 0 ? (
            <span className="absolute bottom-4 left-4 z-20 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {imageCount} image{imageCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <div className="pointer-events-none relative z-20 mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-xl font-semibold leading-7 text-black transition group-hover:text-reality-brand-600">
              <span className="sr-only">{property.title}</span>
              <span className="line-clamp-1">{formatPrice(property)}</span>
            </div>
            <span
              aria-label={`View ${property.title}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-black transition group-hover:bg-reality-bg-muted"
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
                <path
                  d="M5.833 14.167 14.167 5.833m0 0H7.5m6.667 0V12.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </span>
          </div>
          <div className="flex items-start justify-between gap-x-4 gap-y-1 text-base leading-6 text-black">
            <div className="flex min-w-0 flex-1 flex-wrap gap-x-2 gap-y-1">
              {facts.slice(0, 3).map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
            <span className="ml-auto shrink-0 whitespace-nowrap text-sm font-medium text-reality-text-muted">
              For <span className="text-black">{formatListingType(property.listing_type)}</span>
            </span>
          </div>
          <p className="line-clamp-1 text-base leading-6 text-reality-text-muted">
            {property.display_location || `${property.city}, ${property.state}`}
          </p>
        </div>
      </article>
    );
  }

  return (
    <Card
      className={clsx(
        variant === "list"
          ? "group relative grid overflow-hidden md:grid-cols-[260px_1fr]"
          : "group relative overflow-hidden",
        className,
      )}
    >
      <Link
        aria-label={`View ${property.title}`}
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background"
        href={`/properties/${property.slug}`}
      />
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton
          compact
          initialFavorited={property.is_favorited}
          propertyId={property.id}
          propertySlug={property.slug}
        />
      </div>
      <div
        className={
          variant === "list"
            ? "relative aspect-[4/3] h-full overflow-hidden bg-brand-background md:aspect-auto"
            : "relative aspect-[4/3] overflow-hidden bg-brand-background"
        }
      >
        {property.cover_image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
            decoding="async"
            loading="lazy"
            src={property.cover_image_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#06271F,#0B3B2E)] px-6 text-center font-heading text-2xl text-brand-secondary">
            RealityNG
          </div>
        )}
        {imageCount > 0 ? (
          <span className="absolute bottom-3 left-3 z-20 rounded-sm bg-black/65 px-2 py-1 text-xs font-semibold text-white">
            {imageCount} image{imageCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="pointer-events-none relative z-20 flex flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 pr-12">
          {property.featured ? <Badge>Featured</Badge> : null}
          <Badge variant="green">Approved listing</Badge>
          <Badge variant="muted">{formatListingType(property.listing_type)}</Badge>
          <Badge variant="muted">{formatPropertyType(property.property_type)}</Badge>
        </div>
        <h3 className="mt-4 line-clamp-2 font-heading text-xl font-semibold text-brand-text transition group-hover:text-brand-secondary">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-brand-muted">
          {property.display_location || `${property.city}, ${property.state}`}
        </p>
        {property.location_metadata?.has_map_location ? (
          <p className="mt-2 text-xs font-semibold text-brand-muted">
            {property.approximate_location
              ? "Approximate map location"
              : "Exact map location approved"}
          </p>
        ) : null}
        <p className="mt-3 text-2xl font-semibold text-brand-secondary">{formatPrice(property)}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-brand-muted">
          {facts.length > 0 ? (
            facts.map((fact) => (
              <span className="rounded-sm border border-white/10 bg-white/5 px-2 py-1" key={fact}>
                {fact}
              </span>
            ))
          ) : (
            <span className="rounded-sm border border-white/10 bg-white/5 px-2 py-1">
              Details available on request
            </span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-brand-muted">
          {property.description}
        </p>
        <div className="mt-4 grid gap-1 border-t border-white/10 pt-4 text-xs text-brand-muted">
          <p>Availability shown from approved public listing data.</p>
          <p>Listed {formatDate(property.created_at)}</p>
          {property.agent_name ? <p>Representative: {property.agent_name}</p> : null}
        </div>
        <div className="pointer-events-auto relative z-30 mt-4">
          <CompareButton compact property={property} />
        </div>
      </div>
    </Card>
  );
}
