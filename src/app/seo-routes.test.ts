import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { absoluteUrl, propertyJsonLd } from "@/lib/seo";

describe("SEO routes and structured data", () => {
  it("exposes public routes in the sitemap without protected workflows", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/properties"));
    expect(urls).toContain(absoluteUrl("/verification-standards"));
    expect(urls).not.toContain(absoluteUrl("/dashboard"));
    expect(urls).not.toContain(absoluteUrl("/admin"));
  });

  it("blocks protected and transactional routes in robots", () => {
    const config = robots();
    const firstRule = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(firstRule.allow).toContain("/properties");
    expect(firstRule.disallow).toContain("/dashboard");
    expect(firstRule.disallow).toContain("/apply/");
    expect(config.sitemap).toBe(absoluteUrl("/sitemap.xml"));
  });

  it("builds property JSON-LD from API fields without guarantee language", () => {
    const data = propertyJsonLd({
      id: "property-1",
      title: "Approved Lekki Apartment",
      slug: "approved-lekki-apartment",
      description: "A rental apartment close to major roads.",
      property_type: "apartment",
      listing_type: "rent",
      price: "2500000.00",
      currency: "NGN",
      country: "Nigeria",
      state: "Lagos",
      city: "Lagos",
      address: "Lekki Phase 1",
      bedrooms: 3,
      bathrooms: 3,
      parking_spaces: 2,
      land_size: null,
      floor_area: "180.00",
      featured: true,
      cover_image_url: "https://cdn.example.com/cover.jpg",
      created_at: "2026-06-18T00:00:00Z",
    });

    expect(data["@type"]).toBe("Residence");
    expect(data.url).toBe(absoluteUrl("/properties/approved-lekki-apartment"));
    expect(data.offers).toMatchObject({
      "@type": "Offer",
      price: "2500000.00",
      priceCurrency: "NGN",
    });
    expect(JSON.stringify(data)).toContain("does not replace independent legal");
  });
});
