"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import { getPublicProperties } from "@/lib/api/properties";
import { mockAnalytics } from "@/mocks/mock-dashboard";

const categories = [
  { label: "Apartments", value: "apartment" },
  { label: "Family homes", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
];

const stats = [
  { label: "Properties listed", value: String(mockAnalytics.propertiesListed) },
  { label: "Monthly visitors", value: "1,200" },
  { label: "Active agents", value: String(mockAnalytics.activeAgents) },
  { label: "Verified listings", value: String(mockAnalytics.verifiedListings) },
];

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85",
    alt: "Premium modern Nigerian-style detached home exterior",
    label: "Verified family homes",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85",
    alt: "Luxury open-plan apartment interior with large windows",
    label: "Gallery-first apartments",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85",
    alt: "Contemporary premium residential living room",
    label: "Diaspora-ready inspections",
  },
  {
    src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=85",
    alt: "Modern luxury property exterior with evening lighting",
    label: "Approved premium listings",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
    alt: "Elegant furnished apartment dining and living space",
    label: "Shortlets and rentals",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=2200&q=85",
    alt: "Premium residential interior staircase and living area",
    label: "Curated galleries",
  },
  {
    src: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=2200&q=85",
    alt: "High-end modern property lounge with warm lighting",
    label: "Trusted agent inventory",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const featuredQuery = useQuery({
    queryKey: ["homepage-featured-properties"],
    queryFn: () => getPublicProperties({ ordering: "-featured" }),
  });
  const featured = featuredQuery.data?.results.slice(0, 3) ?? [];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

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
        <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <Image
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  activeSlide === index ? "opacity-100" : "opacity-0"
                }`}
                fill
                key={slide.src}
                priority={index === 0}
                sizes="100vw"
                src={slide.src}
              />
            ))}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,21,0.96)_0%,rgba(8,28,21,0.82)_42%,rgba(8,28,21,0.36)_78%,rgba(8,28,21,0.68)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,21,0.48)_0%,rgba(8,28,21,0.12)_45%,rgba(8,28,21,0.88)_100%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-5 py-16 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary sm:text-sm">
                Diaspora-focused Nigerian PropTech
              </p>
              <h1
                className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight text-brand-text sm:text-6xl lg:text-7xl"
                style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
              >
                Find trusted property in Nigeria with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                Discover approved homes, land, shortlets, and commercial listings with
                gallery-first previews, owner controls, and review workflows built for trust.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/properties">
                  Browse properties
                </Link>
                <Link
                  className={buttonClasses("secondary", "w-full sm:w-auto")}
                  href="/properties/new"
                >
                  List property
                </Link>
              </div>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 text-sm text-white/85 sm:grid-cols-3">
              <div className="rounded-md border border-white/15 bg-black/25 p-4 backdrop-blur">
                Approved listing visibility
              </div>
              <div className="rounded-md border border-white/15 bg-black/25 p-4 backdrop-blur">
                Cover image and gallery baseline
              </div>
              <div className="rounded-md border border-white/15 bg-black/25 p-4 backdrop-blur">
                Owner-managed draft workflow
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white/80">{heroSlides[activeSlide].label}</p>
              <div className="flex gap-2" role="tablist" aria-label="Hero property slideshow">
                {heroSlides.map((slide, index) => (
                  <button
                    aria-label={`Show ${slide.label}`}
                    aria-selected={activeSlide === index}
                    className={`h-2.5 rounded-full transition-all ${
                      activeSlide === index
                        ? "w-9 bg-brand-secondary"
                        : "w-2.5 bg-white/45 hover:bg-white/75"
                    }`}
                    key={slide.src}
                    onClick={() => setActiveSlide(index)}
                    role="tab"
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
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
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:px-6 md:grid-cols-4">
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
            <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/properties/new">
              Add listing
            </Link>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
