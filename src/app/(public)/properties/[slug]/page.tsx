"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PageContainer } from "@/components/layout/page-container";
import { PublicShell } from "@/components/layout/public-shell";
import { PropertyMapPanel } from "@/components/maps/property-map-panel";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { StaggerReveal } from "@/components/motion/stagger-reveal";
import { CompareButton } from "@/components/properties/compare-button";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyDetailGallery } from "@/components/properties/property-detail-gallery";
import { ShowInterestButton } from "@/components/properties/show-interest-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listPublicWalkthroughs, type PropertyWalkthrough } from "@/lib/api/inspections";
import { getPublicProperties, getPublicProperty, type Property } from "@/lib/api/properties";
import {
  formatListingType,
  formatPrice,
  formatPropertyType,
  propertySize,
} from "@/lib/properties/format";
import { propertyJsonLd } from "@/lib/seo";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function displayLocation(property: Property) {
  return property.display_location || `${property.city}, ${property.state}`;
}

function propertyFacts(property: Property) {
  return [
    property.bedrooms !== undefined && property.bedrooms !== null
      ? { label: "Bedrooms", value: property.bedrooms }
      : null,
    property.bathrooms !== undefined && property.bathrooms !== null
      ? { label: "Bathrooms", value: property.bathrooms }
      : null,
    propertySize(property) !== "N/A"
      ? {
          label: property.property_type === "land" ? "Land size" : "Size (sqft)",
          value: propertySize(property),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string | number }>;
}

function detailPairs(property: Property) {
  return [
    property.parking_spaces !== undefined && property.parking_spaces !== null
      ? { label: "Parking", value: property.parking_spaces }
      : null,
    property.property_type
      ? { label: "Type", value: formatPropertyType(property.property_type) }
      : null,
    property.listing_type
      ? { label: "Listed for", value: formatListingType(property.listing_type) }
      : null,
    property.lga ? { label: "LGA", value: property.lga } : null,
    property.neighborhood ? { label: "Area", value: property.neighborhood } : null,
    property.landmark ? { label: "Landmark", value: property.landmark } : null,
  ].filter(Boolean) as Array<{ label: string; value: string | number }>;
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
        "This listing is visible through the approved public property endpoint. Draft, rejected, and archived listings are not shown here.",
    },
    {
      title: "Location privacy",
      description: property.approximate_location
        ? "The public pin is approximate to protect owners and occupants."
        : "Location visibility follows the privacy setting supplied with the listing.",
    },
    {
      title: "Representative accountability",
      description: property.agent_name
        ? `${property.agent_name} is shown as the current representative for this listing.`
        : "Representative details are limited, so use structured inquiry before sharing sensitive information.",
    },
  ];
}

function LoadingDetail() {
  return (
    <PublicShell variant="reality">
      <PageContainer className="grid min-h-screen gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div className="h-[627px] animate-pulse rounded-[32px] bg-reality-bg-muted" />
        <div className="h-96 animate-pulse rounded-[24px] bg-reality-bg-muted" />
      </PageContainer>
    </PublicShell>
  );
}

function ErrorDetail() {
  return (
    <PublicShell variant="reality">
      <PageContainer className="py-16">
        <Card className="rounded-[32px] border-reality-border-secondary bg-reality-bg-muted p-8">
          <h1 className="font-display text-3xl font-medium text-black">
            Property could not be loaded.
          </h1>
          <p className="mt-3 text-sm leading-6 text-reality-text-muted">
            The listing may be unavailable, archived, or temporarily unreachable.
          </p>
          <Link className={buttonClasses("reality", "mt-5 w-fit")} href="/properties">
            Browse properties
          </Link>
        </Card>
      </PageContainer>
    </PublicShell>
  );
}

function ShareButton({ property }: { property: Property }) {
  const [message, setMessage] = useState("");

  async function shareProperty() {
    const url = `${window.location.origin}/properties/${property.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title, text: property.description, url });
        return;
      }
      await navigator.clipboard?.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Sharing unavailable");
    }
  }

  return (
    <div>
      <Button className="gap-2" onClick={shareProperty} variant="realityGhost">
        Share
      </Button>
      {message ? (
        <p className="sr-only" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function ActionRail({ property }: { property: Property }) {
  return (
    <Card
      className="rounded-[24px] border-reality-border-secondary bg-white p-5 shadow-reality-sm"
      id="property-actions"
    >
      <div className="grid gap-3">
        <ProtectedActionLink
          actionLabel="Apply for property"
          className={buttonClasses("reality", "w-full")}
          href={`/apply/${property.id}?slug=${property.slug}`}
        >
          Apply for this property
        </ProtectedActionLink>
        <ProtectedActionLink
          actionLabel="Request inspection"
          className={buttonClasses("realitySecondary", "w-full")}
          href={`/properties/${property.slug}/request-inspection`}
        >
          Request inspection
        </ProtectedActionLink>
        <Link className={buttonClasses("realitySecondary", "w-full")} href="#property-showcase">
          Video showcase
        </Link>
        <ShowInterestButton
          className="mt-0"
          listingType={property.listing_type}
          propertyId={property.id}
          propertySlug={property.slug}
          variant="reality"
        />
        <CompareButton property={property} variant="reality" />
        <ProtectedActionLink
          actionLabel="Manage walkthrough videos"
          className={buttonClasses("realityGhost", "w-full")}
          href={`/dashboard/properties/${property.id}/walkthroughs`}
        >
          Manage walkthroughs
        </ProtectedActionLink>
      </div>
    </Card>
  );
}

function RepresentativeCard({ property }: { property: Property }) {
  return (
    <Card className="rounded-[24px] border-reality-border-secondary bg-white p-5 shadow-reality-sm">
      <h2 className="text-sm font-medium text-reality-text-primary">Representative</h2>
      <div className="mt-4 flex items-center gap-3">
        {property.agent_avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={property.agent_name ?? "Property representative"}
            className="h-12 w-12 rounded-full object-cover"
            decoding="async"
            src={property.agent_avatar_url}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-reality-bg-muted" />
        )}
        <div>
          <p className="font-medium text-black">{property.agent_name ?? "RealityNG"}</p>
          <p className="text-sm text-reality-text-muted">
            {property.agent_email ?? "Contact us through inquiry"}
          </p>
        </div>
      </div>
      <ShowInterestButton
        className="mt-5"
        listingType={property.listing_type}
        propertyId={property.id}
        propertySlug={property.slug}
        variant="reality"
      />
      <Link className={buttonClasses("realitySecondary", "mt-3 w-full")} href="#property-actions">
        View profile
      </Link>
    </Card>
  );
}

function PropertyShowcase({
  property,
  walkthroughs,
}: {
  property: Property;
  walkthroughs: PropertyWalkthrough[];
}) {
  const featured = walkthroughs.find((item) => item.is_featured) ?? walkthroughs[0];
  const cover =
    featured?.thumbnail_url ||
    property.cover_image_url ||
    property.image_gallery?.find((image) => image.is_cover)?.image_url ||
    property.image_gallery?.[0]?.image_url;

  return (
    <section className="scroll-mt-28" id="property-showcase">
      <h2 className="text-lg font-medium text-black">Property Showcase</h2>
      <Card className="mt-5 overflow-hidden rounded-[24px] border-reality-border-secondary bg-reality-bg-muted p-0">
        {featured ? (
          <video
            className="aspect-[16/9] w-full bg-black"
            controls
            poster={featured.thumbnail_url || cover || undefined}
            preload="metadata"
            src={featured.video_url}
          />
        ) : cover ? (
          <div className="relative aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${property.title} showcase`}
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
              src={cover}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white p-4 text-sm font-semibold text-reality-text-primary shadow-reality-sm">
                Video pending
              </span>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center px-8 text-center font-display text-3xl font-medium text-reality-brand-700">
            RealityNG
          </div>
        )}
        <div className="p-5">
          <p className="font-medium text-black">{featured?.title ?? "No moderated video yet"}</p>
          <p className="mt-2 text-sm leading-6 text-reality-text-muted">
            {featured?.description ??
              "Public walkthrough videos appear here after RealityNG moderation. Request an inspection or viewing for stronger evidence before making a decision."}
          </p>
        </div>
      </Card>
    </section>
  );
}

function SimilarProperties({ currentProperty }: { currentProperty: Property }) {
  const primarySimilarQuery = useQuery({
    queryKey: ["public-properties", "similar", currentProperty.id, "type"],
    queryFn: () =>
      getPublicProperties({
        property_type: currentProperty.property_type,
        listing_type: currentProperty.listing_type,
        ordering: "-featured",
      }),
  });
  const fallbackSimilarQuery = useQuery({
    queryKey: ["public-properties", "similar", currentProperty.id, "listing"],
    queryFn: () =>
      getPublicProperties({
        listing_type: currentProperty.listing_type,
        ordering: "-featured",
      }),
    enabled:
      !primarySimilarQuery.isLoading &&
      (primarySimilarQuery.data?.results ?? []).filter(
        (property) => property.id !== currentProperty.id,
      ).length === 0,
  });
  const broadSimilarQuery = useQuery({
    queryKey: ["public-properties", "similar", currentProperty.id, "all"],
    queryFn: () =>
      getPublicProperties({
        ordering: "-featured",
      }),
    enabled:
      !fallbackSimilarQuery.isLoading &&
      !primarySimilarQuery.isLoading &&
      (primarySimilarQuery.data?.results ?? []).filter(
        (property) => property.id !== currentProperty.id,
      ).length === 0 &&
      (fallbackSimilarQuery.data?.results ?? []).filter(
        (property) => property.id !== currentProperty.id,
      ).length === 0,
  });
  const sourceResults =
    (primarySimilarQuery.data?.results ?? []).filter(
      (property) => property.id !== currentProperty.id,
    ).length > 0
      ? primarySimilarQuery.data?.results
      : (fallbackSimilarQuery.data?.results ?? []).filter(
            (property) => property.id !== currentProperty.id,
          ).length > 0
        ? fallbackSimilarQuery.data?.results
        : broadSimilarQuery.data?.results;
  const similar = [...(sourceResults ?? [])]
    .filter((property) => property.id !== currentProperty.id)
    .sort((a, b) => {
      const aScore =
        Number(a.city === currentProperty.city) +
        Number(a.state === currentProperty.state) +
        Number(a.neighborhood === currentProperty.neighborhood);
      const bScore =
        Number(b.city === currentProperty.city) +
        Number(b.state === currentProperty.state) +
        Number(b.neighborhood === currentProperty.neighborhood);
      return bScore - aScore;
    })
    .slice(0, 4);

  if (primarySimilarQuery.isLoading || fallbackSimilarQuery.isLoading || broadSimilarQuery.isLoading) {
    return (
      <section>
        <h2 className="text-lg font-medium text-black">Similar properties</h2>
        <div className="mt-8 flex gap-6 overflow-hidden">
          {[0, 1].map((item) => (
            <div
              className="h-[380px] w-[314px] shrink-0 animate-pulse rounded-[32px] bg-reality-bg-muted"
              key={item}
            />
          ))}
        </div>
      </section>
    );
  }

  if (
    (primarySimilarQuery.isError && fallbackSimilarQuery.isError && broadSimilarQuery.isError) ||
    similar.length === 0
  ) {
    return null;
  }

  return (
    <section>
      <div>
        <h2 className="text-lg font-medium text-black">Similar properties</h2>
        <p className="mt-2 text-sm text-reality-text-muted">
          List of recommended and great properties
        </p>
      </div>
      <StaggerReveal className="mt-8 flex gap-6 overflow-x-auto pb-4" stagger={0.05} y={14}>
        {similar.map((property) => (
          <div data-motion-child key={property.id}>
            <PropertyCard property={property} variant="reality" />
          </div>
        ))}
      </StaggerReveal>
    </section>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const propertyQuery = useQuery({
    queryKey: ["public-property", params.slug],
    queryFn: () => getPublicProperty(params.slug),
    enabled: Boolean(params.slug),
  });
  const property = propertyQuery.data;
  const walkthroughsQuery = useQuery({
    queryKey: ["public-property-walkthroughs", property?.id],
    queryFn: () => listPublicWalkthroughs(property?.id ?? ""),
    enabled: Boolean(property?.id),
  });
  const facts = useMemo(() => (property ? propertyFacts(property) : []), [property]);
  const details = useMemo(() => (property ? detailPairs(property) : []), [property]);

  if (propertyQuery.isLoading) {
    return <LoadingDetail />;
  }

  if (propertyQuery.isError) {
    return <ErrorDetail />;
  }

  if (!property) {
    return null;
  }

  const amenities = property.amenities?.length ? property.amenities : fallbackAmenities(property);
  const walkthroughs = walkthroughsQuery.data ?? [];

  return (
    <PublicShell variant="reality">
      <JsonLd data={propertyJsonLd(property)} id="realityng-property-jsonld" />
      <main className="bg-white pb-20 text-reality-text-primary">
        <PageContainer className="hidden py-8 lg:block">
          <div className="flex items-center justify-between">
            <Link
              className="text-sm font-medium text-reality-text-tertiary transition hover:text-black"
              href="/properties"
            >
              Back
            </Link>
            <div className="flex items-center gap-4">
              <FavoriteButton
                className="h-10"
                initialFavorited={property.is_favorited}
                propertyId={property.id}
                propertySlug={property.slug}
                variant="reality"
              />
              <ShareButton property={property} />
            </div>
          </div>
        </PageContainer>

        <PageContainer className="relative">
          <div className="lg:hidden">
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 pt-8">
              <Link
                aria-label="Back to properties"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-black shadow-reality-sm"
                href="/properties"
              >
                <span aria-hidden="true">‹</span>
              </Link>
              <div className="flex items-center gap-3">
                <FavoriteButton
                  compact
                  className="h-10 w-10 border-0 bg-black/30 text-white hover:bg-black/45"
                  initialFavorited={property.is_favorited}
                  propertyId={property.id}
                  propertySlug={property.slug}
                  variant="reality"
                />
                <ShareButton property={property} />
              </div>
            </div>
          </div>
          <ParallaxMedia>
            <PropertyDetailGallery property={property} />
          </ParallaxMedia>
        </PageContainer>

        <PageContainer className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,700px)_360px] lg:items-start">
          <StaggerReveal className="space-y-10" stagger={0.06} y={18}>
            <section data-motion-child>
              <p className="text-sm font-medium text-reality-text-muted">
                For {formatListingType(property.listing_type)}
              </p>
              <h1 className="mt-2 font-body text-2xl font-semibold leading-8 text-black lg:text-[40px] lg:leading-[48px]">
                {formatPrice(property)}
              </h1>
              <p className="mt-2 text-sm font-medium text-reality-text-secondary lg:text-base">
                {displayLocation(property)}
              </p>
              <p className="sr-only">{property.title}</p>
              {facts.length > 0 ? (
                <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
                  {facts.map((fact) => (
                    <Card
                      className="min-w-[96px] rounded-[16px] border-0 bg-reality-bg-muted p-4 shadow-none"
                      key={fact.label}
                    >
                      <p className="font-medium text-black">{fact.value}</p>
                      <p className="mt-1 text-sm text-reality-text-muted">{fact.label}</p>
                    </Card>
                  ))}
                </div>
              ) : null}
            </section>

            {details.length > 0 ? (
              <section
                className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm lg:max-w-md"
                data-motion-child
              >
                {details.map((detail) => (
                  <div className="flex gap-2" key={`${detail.label}-${detail.value}`}>
                    <span className="text-reality-text-muted">{detail.label}</span>
                    <span className="font-medium text-black">{detail.value}</span>
                  </div>
                ))}
              </section>
            ) : null}

            <section data-motion-child>
              <h2 className="text-lg font-medium text-black">About this property</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-reality-text-muted">
                {property.description}
              </p>
            </section>

            {amenities.length > 0 ? (
              <section data-motion-child>
                <h2 className="text-lg font-medium text-black">Amenities and details</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {amenities.map((item) => (
                    <div
                      className="flex items-center gap-3 text-sm text-reality-text-secondary"
                      key={item}
                    >
                      <span className="h-2 w-2 rounded-full bg-reality-brand-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section data-motion-child>
              <h2 className="text-lg font-medium text-black">Location</h2>
              <div className="mt-5 overflow-hidden rounded-[24px]">
                <PropertyMapPanel
                  properties={[property]}
                  selectedPropertyId={property.id}
                  variant="reality"
                />
              </div>
            </section>

            <section data-motion-child>
              <h2 className="text-lg font-medium text-black">Places around</h2>
              <div className="mt-4 grid gap-3 text-sm text-reality-text-muted sm:grid-cols-2">
                <p>
                  <span className="font-medium text-black">Display area</span>
                  <br />
                  {displayLocation(property)}
                </p>
                <p>
                  <span className="font-medium text-black">Precision</span>
                  <br />
                  {property.location_metadata?.precision_label ?? "Not available"}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-reality-text-muted">
                Nearby schools, hospitals, stores, and transport POIs are not supplied by the
                current public property API, so this section only shows real location metadata.
              </p>
            </section>

            <div data-motion-child>
              <PropertyShowcase property={property} walkthroughs={walkthroughs} />
            </div>

            <section data-motion-child>
              <h2 className="text-lg font-medium text-black">Safety and trust</h2>
              <div className="mt-5 grid gap-4">
                {trustItems(property).map((item) => (
                  <Card
                    className="rounded-[20px] border-reality-border-secondary bg-reality-bg-muted p-5 shadow-none"
                    key={item.title}
                  >
                    <h3 className="font-medium text-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-reality-text-muted">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-reality-text-muted">
                Listed {formatDate(property.created_at)}. Do not send money or sensitive documents
                outside approved RealityNG workflows.
              </p>
            </section>

            <SimilarProperties currentProperty={property} />
          </StaggerReveal>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <ActionRail property={property} />
            <RepresentativeCard property={property} />
          </aside>
        </PageContainer>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-reality-border-secondary bg-white/95 p-3 shadow-reality-sm backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            <Link className={buttonClasses("realitySecondary", "w-full")} href="#property-actions">
              Enquire
            </Link>
            <ProtectedActionLink
              actionLabel="Apply for property"
              className={buttonClasses("reality", "w-full")}
              href={`/apply/${property.id}?slug=${property.slug}`}
            >
              Apply
            </ProtectedActionLink>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
