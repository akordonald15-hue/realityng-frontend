"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicProperty } from "@/lib/api/properties";
import { formatPrice, formatPropertyType, propertySize } from "@/lib/properties/format";

function galleryAlt(index: number) {
  return `Property gallery image ${index + 1}`;
}

export default function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const propertyQuery = useQuery({
    queryKey: ["public-property", params.slug],
    queryFn: () => getPublicProperty(params.slug),
    enabled: Boolean(params.slug),
  });
  const property = propertyQuery.data;
  const gallery = useMemo(() => property?.image_gallery ?? [], [property]);
  const cover = gallery.find((image) => image.is_cover) ?? gallery[0];

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <Link className="text-sm font-semibold text-brand-secondary" href="/properties">
          Back to properties
        </Link>
        {propertyQuery.isLoading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="h-[520px] animate-pulse rounded-md bg-white/10" />
            <div className="h-96 animate-pulse rounded-md bg-white/10" />
          </div>
        ) : null}
        {propertyQuery.isError ? (
          <Card className="mt-8 p-8 text-red-200">Property could not be loaded.</Card>
        ) : null}
        {property ? (
          <>
            <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="overflow-hidden rounded-md border border-white/10 bg-brand-surface">
                  <div className="aspect-[16/10] bg-brand-primary">
                    {cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={cover.caption || property.title}
                        className="h-full w-full object-cover"
                        decoding="async"
                        loading="eager"
                        src={cover.image_url}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-heading text-4xl text-brand-secondary">
                        RealityNG
                      </div>
                    )}
                  </div>
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-5">
                      {gallery.slice(0, 5).map((image, index) => (
                        <div
                          className="aspect-square overflow-hidden rounded-sm bg-brand-background"
                          key={image.id}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={image.caption || galleryAlt(index)}
                            className="h-full w-full object-cover"
                            decoding="async"
                            loading="lazy"
                            src={image.image_url}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{property.listing_type}</Badge>
                    <Badge variant="muted">{formatPropertyType(property.property_type)}</Badge>
                    {property.featured ? <Badge variant="green">Featured</Badge> : null}
                  </div>
                  <h1 className="mt-4 font-heading text-4xl font-semibold text-brand-text sm:text-5xl">
                    {property.title}
                  </h1>
                  <p className="mt-3 text-brand-muted">
                    {property.address}, {property.city}, {property.state}
                  </p>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-brand-muted">
                    {property.description}
                  </p>
                </div>
              </div>
              <aside className="space-y-5">
                <Card className="p-5">
                  <p className="text-sm uppercase tracking-wide text-brand-muted">Price</p>
                  <p className="mt-2 font-heading text-4xl font-semibold text-brand-secondary">
                    {formatPrice(property)}
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    Listed for {property.listing_type}
                  </p>
                  <FavoriteButton
                    className="mt-5 w-full"
                    initialFavorited={property.is_favorited}
                    propertyId={property.id}
                    propertySlug={property.slug}
                  />
                </Card>
                <Card className="p-5">
                  <h2 className="font-heading text-2xl font-semibold text-brand-text">
                    Property details
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-brand-muted">Bedrooms</dt>
                      <dd className="font-semibold text-brand-text">
                        {property.bedrooms ?? "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-muted">Bathrooms</dt>
                      <dd className="font-semibold text-brand-text">
                        {property.bathrooms ?? "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-muted">Parking</dt>
                      <dd className="font-semibold text-brand-text">
                        {property.parking_spaces ?? "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-muted">Size</dt>
                      <dd className="font-semibold text-brand-text">{propertySize(property)}</dd>
                    </div>
                  </dl>
                </Card>
                <Card className="p-5">
                  <h2 className="font-heading text-2xl font-semibold text-brand-text">Amenities</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(property.amenities?.length
                      ? property.amenities
                      : [
                          property.bedrooms ? `${property.bedrooms} bedrooms` : null,
                          property.bathrooms ? `${property.bathrooms} bathrooms` : null,
                          property.parking_spaces
                            ? `${property.parking_spaces} parking spaces`
                            : null,
                          property.floor_area ? "Floor area recorded" : null,
                          property.land_size ? "Land size recorded" : null,
                        ]
                    )
                      .filter(Boolean)
                      .map((item) => (
                        <Badge key={item} variant="muted">
                          {item}
                        </Badge>
                      ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <h2 className="font-heading text-2xl font-semibold text-brand-text">
                    Agent/contact
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    {property.agent_avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={property.agent_name ?? "Property agent"}
                        className="h-14 w-14 rounded-md object-cover"
                        decoding="async"
                        src={property.agent_avatar_url}
                      />
                    ) : null}
                    <div>
                      <p className="font-semibold text-brand-text">
                        {property.agent_name ?? "Verified RealityNG agent"}
                      </p>
                      <p className="text-sm text-brand-muted">{property.agent_email}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">
                    Demo contact card only. Inquiry workflows remain out of scope for this build.
                  </p>
                  <Button className="mt-4 w-full" disabled>
                    Inquiry demo preview
                  </Button>
                </Card>
              </aside>
            </section>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
