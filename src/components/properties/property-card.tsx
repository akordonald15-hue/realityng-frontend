import Link from "next/link";

import { FavoriteButton } from "@/components/properties/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Property } from "@/lib/api/properties";
import { formatPrice, formatPropertyType, propertySize } from "@/lib/properties/format";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          compact
          initialFavorited={property.is_favorited}
          propertyId={property.id}
          propertySlug={property.slug}
        />
      </div>
      <Link aria-label={`View ${property.title}`} href={`/properties/${property.slug}`}>
        <div className="aspect-[4/3] overflow-hidden bg-brand-background">
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
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#11241D,#0F3D2E)] px-6 text-center font-heading text-2xl text-brand-secondary">
              RealityNG
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{property.listing_type}</Badge>
          <Badge variant="muted">{formatPropertyType(property.property_type)}</Badge>
          {property.featured ? <Badge variant="green">Featured</Badge> : null}
        </div>
        <Link href={`/properties/${property.slug}`}>
          <h3 className="mt-4 line-clamp-2 font-heading text-xl font-semibold text-brand-text transition hover:text-brand-secondary">
            {property.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-muted">
          {property.description}
        </p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-muted">Price</p>
            <p className="font-semibold text-brand-secondary">{formatPrice(property)}</p>
          </div>
          <div className="text-right text-sm text-brand-muted">
            <p>{property.city}</p>
            <p>
              {property.bedrooms ?? "N/A"} beds / {propertySize(property)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
