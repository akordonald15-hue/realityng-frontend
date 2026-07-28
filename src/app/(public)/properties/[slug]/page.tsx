"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { CompareButton } from "@/components/properties/compare-button";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { ShowInterestButton } from "@/components/properties/show-interest-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicProperty } from "@/lib/api/properties";
import type { Property } from "@/lib/api/properties";
import {
  formatListingType,
  formatPrice,
  formatPropertyType,
  propertySize,
} from "@/lib/properties/format";
import { propertyJsonLd } from "@/lib/seo";

function galleryAlt(index: number) {
  return `Property gallery image ${index + 1}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function propertyFacts(property: Property) {
  return [
    {
      label: "Bedrooms",
      value: property.bedrooms ?? "N/A",
    },
    {
      label: "Bathrooms",
      value: property.bathrooms ?? "N/A",
    },
    {
      label: "Parking",
      value: property.parking_spaces ?? "N/A",
    },
    {
      label: property.property_type === "land" ? "Land size" : "Size",
      value: propertySize(property),
    },
  ];
}

function fallbackAmenities(property: Property) {
  return [
    property.bedrooms ? `${property.bedrooms} bedrooms recorded` : null,
    property.bathrooms ? `${property.bathrooms} bathrooms recorded` : null,
    property.parking_spaces ? `${property.parking_spaces} parking spaces` : null,
    property.floor_area ? "Floor area recorded" : null,
    property.land_size ? "Land size recorded" : null,
    property.featured ? "Featured listing" : null,
  ].filter(Boolean) as string[];
}

function trustItems(property: Property) {
  return [
    {
      title: "Public approval",
      description:
        "This property is visible through the approved public listing endpoint. Draft, pending, rejected, and archived listings are not shown here.",
    },
    {
      title: "Gallery transparency",
      description:
        property.image_count || property.image_gallery?.length
          ? "The listing includes media for visual review before a user takes the next step."
          : "No gallery has been attached yet, so request more evidence before making decisions.",
    },
    {
      title: "Representative accountability",
      description: property.agent_name
        ? `${property.agent_name} is shown as the current representative for this listing.`
        : "Representative details are limited on this listing. Use structured inquiry before sharing sensitive information.",
    },
    {
      title: "Verification scope",
      description:
        "Identity and property verification workflows are available in RealityNG, but users should review each visible badge and limitation before relying on a claim.",
    },
  ];
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
  const imageCount = property?.image_count ?? gallery.length;

  return (
    <div className="min-h-screen bg-brand-background pb-24 text-brand-text lg:pb-0">
      <Navbar />
      <main>
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
          <Link className="text-sm font-semibold text-brand-secondary" href="/properties">
            Back to properties
          </Link>
        </div>

        {propertyQuery.isLoading ? (
          <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 sm:px-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[520px] animate-pulse rounded-md bg-white/10" />
            <div className="h-96 animate-pulse rounded-md bg-white/10" />
          </section>
        ) : null}

        {propertyQuery.isError ? (
          <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6">
            <Card className="p-8">
              <h1 className="font-heading text-3xl font-semibold text-brand-text">
                Property could not be loaded.
              </h1>
              <p className="mt-3 text-sm leading-6 text-brand-muted">
                The listing may be unavailable, archived, or temporarily unreachable.
              </p>
              <Link className={buttonClasses("primary", "mt-5 w-fit")} href="/properties">
                Browse properties
              </Link>
            </Card>
          </section>
        ) : null}

        {property ? (
          <>
            <JsonLd data={propertyJsonLd(property)} id="realityng-property-jsonld" />
            <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:items-start">
              <div className="space-y-8">
                <div className="overflow-hidden rounded-md border border-white/10 bg-brand-surface">
                  <div className="relative aspect-[16/10] bg-brand-primary">
                    {cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={cover.caption || property.title}
                        className="h-full w-full object-cover"
                        decoding="async"
                        loading="eager"
                        src={cover.image_url}
                      />
                    ) : property.cover_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={property.title}
                        className="h-full w-full object-cover"
                        decoding="async"
                        loading="eager"
                        src={property.cover_image_url}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#06271F,#0B3B2E)] px-6 text-center font-heading text-4xl text-brand-secondary">
                        RealityNG
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <Badge>Approved listing</Badge>
                      {imageCount ? (
                        <Badge variant="muted">
                          {imageCount} image{imageCount === 1 ? "" : "s"}
                        </Badge>
                      ) : null}
                    </div>
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

                <section>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{formatListingType(property.listing_type)}</Badge>
                    <Badge variant="muted">{formatPropertyType(property.property_type)}</Badge>
                    {property.featured ? <Badge variant="green">Featured</Badge> : null}
                  </div>
                  <h1 className="mt-4 font-heading text-4xl font-semibold text-brand-text sm:text-5xl">
                    {property.title}
                  </h1>
                  <p className="mt-3 text-brand-muted">
                    {property.address}, {property.city}, {property.state}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-4">
                    {propertyFacts(property).map((fact) => (
                      <Card className="p-4" key={fact.label}>
                        <p className="text-xs uppercase tracking-wide text-brand-muted">
                          {fact.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-brand-text">{fact.value}</p>
                      </Card>
                    ))}
                  </div>
                  {property.listing_type === "apartment_share" ? (
                    <div className="mt-6 border-l-2 border-brand-secondary bg-brand-secondary/10 px-4 py-3">
                      <p className="font-semibold text-brand-text">Apartment share</p>
                      <p className="mt-1 text-sm leading-6 text-brand-muted">
                        This listing offers shared occupancy. Confirm the available room, shared
                        amenities, and household expectations with the listing owner.
                      </p>
                    </div>
                  ) : null}
                </section>

                <section>
                  <h2 className="font-heading text-3xl font-semibold text-brand-text">
                    About this property
                  </h2>
                  <p className="mt-4 max-w-4xl text-base leading-8 text-brand-muted">
                    {property.description}
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-3xl font-semibold text-brand-text">
                    Amenities and utilities
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(property.amenities?.length ? property.amenities : fallbackAmenities(property))
                      .filter(Boolean)
                      .map((item) => (
                        <Badge key={item} variant="muted">
                          {item}
                        </Badge>
                      ))}
                  </div>
                </section>

                <section id="verification-report">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                        Verification report
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
                        Trust signals and current limitations
                      </h2>
                    </div>
                    <Link className="text-sm font-semibold text-brand-secondary" href="/verification">
                      Open verification centre
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {trustItems(property).map((item) => (
                      <Card className="p-5" key={item.title}>
                        <h3 className="font-heading text-xl font-semibold text-brand-text">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-brand-muted">
                          {item.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-3xl font-semibold text-brand-text">
                    Location and disclosure
                  </h2>
                  <Card className="mt-4 p-5">
                    <p className="text-sm leading-7 text-brand-muted">
                      Public location is shown from the listing address fields available today:
                      <span className="font-semibold text-brand-text">
                        {" "}
                        {property.city}, {property.state}, {property.country}.
                      </span>{" "}
                      Exact access details, landmark context, and inspection instructions should be
                      confirmed through a structured inquiry or viewing workflow.
                    </p>
                  </Card>
                </section>

                <section>
                  <h2 className="font-heading text-3xl font-semibold text-brand-text">
                    Safety and reporting
                  </h2>
                  <Card className="mt-4 p-5">
                    <p className="text-sm leading-7 text-brand-muted">
                      Do not send money or sensitive documents outside approved RealityNG workflows.
                      Use Show Interest first, confirm who you are speaking with, and request
                      additional verification where needed.
                    </p>
                    <Link
                      className={buttonClasses("secondary", "mt-4 w-fit")}
                      href="/contact"
                    >
                      Get help
                    </Link>
                  </Card>
                </section>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-28">
                <Card className="p-5" id="property-actions">
                  <p className="text-sm uppercase tracking-wide text-brand-muted">Price</p>
                  <p className="mt-2 font-heading text-4xl font-semibold text-brand-secondary">
                    {formatPrice(property)}
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">
                    Listed for {formatListingType(property.listing_type)}
                  </p>
                  <div className="mt-5 grid gap-3">
                    <FavoriteButton
                      className="w-full"
                      initialFavorited={property.is_favorited}
                      propertyId={property.id}
                      propertySlug={property.slug}
                    />
                    <CompareButton property={property} />
                    <ShowInterestButton
                      listingType={property.listing_type}
                      propertyId={property.id}
                      propertySlug={property.slug}
                    />
                    <ProtectedActionLink
                      actionLabel="Apply for property"
                      className={buttonClasses("secondary", "w-full")}
                      href={`/apply/${property.id}?slug=${property.slug}`}
                    >
                      Apply for this property
                    </ProtectedActionLink>
                  </div>
                </Card>

                <Card className="p-5">
                  <h2 className="font-heading text-2xl font-semibold text-brand-text">
                    Representative
                  </h2>
                  <div className="mt-4 flex items-center gap-3">
                    {property.agent_avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        alt={property.agent_name ?? "Property representative"}
                        className="h-14 w-14 rounded-md object-cover"
                        decoding="async"
                        src={property.agent_avatar_url}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-white/10 font-heading text-xl text-brand-secondary">
                        RN
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-brand-text">
                        {property.agent_name ?? "RealityNG representative"}
                      </p>
                      <p className="text-sm text-brand-muted">
                        {property.agent_email ?? "Contact available after inquiry"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">
                    Use the structured inquiry flow so your interest, contact preference, and next
                    actions can be tracked safely.
                  </p>
                </Card>

                <Card className="p-5">
                  <h2 className="font-heading text-2xl font-semibold text-brand-text">
                    Next steps
                  </h2>
                  <ol className="mt-4 grid gap-3 text-sm text-brand-muted">
                    <li>1. Review the gallery, facts, location, and verification notes.</li>
                    <li>2. Show interest when the property fits your goal.</li>
                    <li>3. Request a viewing from your dashboard after inquiry follow-up.</li>
                    <li>4. Apply only when you are ready to proceed.</li>
                  </ol>
                </Card>
              </aside>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-brand-background/95 p-3 backdrop-blur lg:hidden">
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
                <Link className={buttonClasses("primary", "w-full")} href="#property-actions">
                  Show interest
                </Link>
                <ProtectedActionLink
                  actionLabel="Apply for property"
                  className={buttonClasses("secondary", "w-full")}
                  href={`/apply/${property.id}?slug=${property.slug}`}
                >
                  Apply
                </ProtectedActionLink>
              </div>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
