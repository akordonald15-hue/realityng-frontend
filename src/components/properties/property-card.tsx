import Link from "next/link";

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
  variant?: "grid" | "list";
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

export function PropertyCard({ property, variant = "grid" }: PropertyCardProps) {
  const facts = propertyFacts(property);
  const imageCount = property.image_count ?? property.image_gallery?.length ?? 0;

  return (
    <Card
      className={
        variant === "list"
          ? "group relative grid overflow-hidden md:grid-cols-[260px_1fr]"
          : "group relative overflow-hidden"
      }
    >
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          compact
          initialFavorited={property.is_favorited}
          propertyId={property.id}
          propertySlug={property.slug}
        />
      </div>
      <Link aria-label={`View ${property.title}`} href={`/properties/${property.slug}`}>
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
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
            <span className="absolute bottom-3 left-3 rounded-sm bg-black/65 px-2 py-1 text-xs font-semibold text-white">
              {imageCount} image{imageCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 pr-12">
          {property.featured ? <Badge>Featured</Badge> : null}
          <Badge variant="green">Approved listing</Badge>
          <Badge variant="muted">{formatListingType(property.listing_type)}</Badge>
          <Badge variant="muted">{formatPropertyType(property.property_type)}</Badge>
        </div>
        <Link href={`/properties/${property.slug}`}>
          <h3 className="mt-4 line-clamp-2 font-heading text-xl font-semibold text-brand-text transition hover:text-brand-secondary">
            {property.title}
          </h3>
        </Link>
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
        <p className="mt-3 text-2xl font-semibold text-brand-secondary">
          {formatPrice(property)}
        </p>
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
        <CompareButton className="mt-4" compact property={property} />
      </div>
    </Card>
  );
}
