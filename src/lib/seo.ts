import type { Property } from "@/lib/api/properties";
import { formatListingType, formatPrice, formatPropertyType } from "@/lib/properties/format";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://realityng.com");

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/properties", priority: 0.95, changeFrequency: "hourly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/verification-standards", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/listing-standards", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/safety", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/help", priority: 0.65, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.35, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.35, changeFrequency: "yearly" as const },
  { path: "/data-deletion", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/refunds", priority: 0.3, changeFrequency: "yearly" as const },
];

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RealityNG",
    url: absoluteUrl("/"),
    slogan: "Where Dreams Find an Address",
    logo: absoluteUrl("/brand/realityng-logo-header.png"),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@realityng.com",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
  };
}

export function websiteSearchJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RealityNG",
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/properties")}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function propertyJsonLd(property: Property) {
  const image =
    property.cover_image_url || property.image_gallery?.find((item) => item.is_cover)?.image_url;

  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description,
    url: absoluteUrl(`/properties/${property.slug}`),
    image: image ? [image] : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: property.country || "NG",
    },
    numberOfRooms: property.bedrooms ?? undefined,
    amenityFeature: property.amenities?.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency || "NGN",
      availability: "https://schema.org/InStock",
      category: `${formatListingType(property.listing_type)} ${formatPropertyType(property.property_type)}`,
      url: absoluteUrl(`/properties/${property.slug}`),
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Display price",
        value: formatPrice(property),
      },
      {
        "@type": "PropertyValue",
        name: "Verification limitation",
        value:
          "RealityNG public approval is a marketplace signal and does not replace independent legal, title, financial, or inspection due diligence.",
      },
    ],
  };
}
