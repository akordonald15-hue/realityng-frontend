import type { Property } from "@/lib/api/properties";

function formatPrice(property: Property) {
  const amount = Number(property.price);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      {property.cover_image_url ? (
        <div className="mb-4 aspect-[16/9] overflow-hidden rounded-sm bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={property.title}
            className="h-full w-full object-cover"
            src={property.cover_image_url}
          />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {property.listing_type} / {property.property_type.replace("_", " ")}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{property.title}</h2>
        </div>
        {property.featured ? (
          <span className="rounded-sm bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
            Featured
          </span>
        ) : null}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{property.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">Price</dt>
          <dd className="font-semibold text-ink">{formatPrice(property)}</dd>
        </div>
        <div>
          <dt className="text-muted">Location</dt>
          <dd className="font-semibold text-ink">{property.city}</dd>
        </div>
        <div>
          <dt className="text-muted">Beds</dt>
          <dd className="font-semibold text-ink">{property.bedrooms ?? "N/A"}</dd>
        </div>
        <div>
          <dt className="text-muted">Size</dt>
          <dd className="font-semibold text-ink">
            {property.land_size ?? property.floor_area ?? "N/A"} sqm
          </dd>
        </div>
      </dl>
    </article>
  );
}
