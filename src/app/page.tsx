"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { getPublicProperties } from "@/lib/api/properties";

const categories = [
  { label: "Apartments", value: "apartment" },
  { label: "Family homes", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
];

const stats = [
  { label: "Verified listing workflow", value: "100%" },
  { label: "Gallery limit per listing", value: "30" },
  { label: "Core Nigerian cities", value: "36+" },
];

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const featuredQuery = useQuery({
    queryKey: ["homepage-featured-properties"],
    queryFn: () => getPublicProperties({ ordering: "-featured" }),
  });
  const featured = featuredQuery.data?.results.slice(0, 3) ?? [];

  function searchProperties() {
    const params = new URLSearchParams();
    if (city) {
      params.set("city", city);
    }
    if (listingType) {
      params.set("listing_type", listingType);
    }
    router.push(`/properties${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-secondary">
              Diaspora-focused Nigerian PropTech
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-5xl font-semibold leading-tight text-brand-text sm:text-6xl lg:text-7xl">
              Find trusted property in Nigeria with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-muted">
              Discover approved homes, land, and commercial listings with gallery-first previews,
              owner controls, and review workflows built for trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties">
                <Button>Browse properties</Button>
              </Link>
              <Link href="/properties/new">
                <Button variant="secondary">List property</Button>
              </Link>
            </div>
          </div>
          <Card className="p-5">
            <div className="aspect-[4/5] rounded-md bg-[linear-gradient(150deg,#0F3D2E,#11241D_48%,#D4A017_160%)] p-5">
              <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-brand-background/35 p-5">
                <div>
                  <p className="text-sm text-brand-muted">Featured journey</p>
                  <h2 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
                    Lagos apartment search to verified gallery review.
                  </h2>
                </div>
                <div className="grid gap-3 text-sm text-brand-muted">
                  <div className="rounded-md bg-white/10 p-3">Approved listing visibility</div>
                  <div className="rounded-md bg-white/10 p-3">Cover image and gallery baseline</div>
                  <div className="rounded-md bg-white/10 p-3">Owner-managed draft workflow</div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_1fr_auto]">
            <Input
              aria-label="Search city"
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search by city"
              value={city}
            />
            <Select
              aria-label="Listing type"
              onChange={(event) => setListingType(event.target.value)}
              value={listingType}
            >
              <option value="">Sale or rent</option>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </Select>
            <Button onClick={searchProperties}>Search</Button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
          <SectionHeader
            eyebrow="Categories"
            title="Browse by property goal"
            description="Move quickly into the main listing categories supported by the current property core."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link href={`/properties?property_type=${category.value}`} key={category.value}>
                <Card className="p-5 transition hover:border-brand-secondary/50">
                  <p className="font-heading text-2xl font-semibold text-brand-text">
                    {category.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">
                    View approved {category.label.toLowerCase()} across Nigerian markets.
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-brand-primary">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:px-6 md:grid-cols-3">
            {stats.map((stat) => (
              <div className="border-l border-brand-secondary/50 pl-5" key={stat.label}>
                <p className="font-heading text-4xl font-semibold text-brand-secondary">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Featured"
              title="Latest approved properties"
              description="A quick look at approved listings with gallery-aware cards."
            />
            <Link className="text-sm font-semibold text-brand-secondary" href="/properties">
              View all properties
            </Link>
          </div>
          {featuredQuery.isLoading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div className="h-80 animate-pulse rounded-md bg-white/10" key={item} />
              ))}
            </div>
          ) : null}
          {featured.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : null}
          {!featuredQuery.isLoading && featured.length === 0 ? (
            <Card className="mt-8 p-8 text-brand-muted">Featured properties will appear here.</Card>
          ) : null}
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6">
          <Card className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-brand-text">
                Ready to present a verified listing?
              </h2>
              <p className="mt-3 max-w-2xl text-brand-muted">
                Create the draft, add location details, and upload a gallery that helps buyers and
                renters inspect the property clearly.
              </p>
            </div>
            <Link href="/properties/new">
              <Button>Add listing</Button>
            </Link>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
