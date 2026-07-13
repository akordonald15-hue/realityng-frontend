"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
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
  {
    label: "Hotels and shortlets",
    href: "/properties?search=shortlet",
    description: "Fast-moving stays, serviced apartments, and hospitality-ready listings.",
  },
  {
    label: "Apartment sharing",
    href: "/properties?listing_type=apartment_share",
    description: "Shared homes and available rooms for flexible city living.",
  },
  {
    label: "Family homes",
    href: "/properties?property_type=house",
    description: "Houses and duplexes suited to families and long-term ownership.",
  },
  {
    label: "Lands",
    href: "/properties?property_type=land",
    description: "Residential and investment land across established markets.",
  },
  {
    label: "Commercial properties",
    href: "/properties?property_type=commercial",
    description: "Office, retail, hospitality, and income-producing opportunities.",
  },
];

const actionCards = [
  {
    title: "Browse property",
    description: "Search approved listings, save favorites, compare options, and start an inquiry.",
    href: "/properties",
    cta: "Browse properties",
  },
  {
    title: "List property",
    description:
      "Open your dashboard workspace and start a draft listing when your profile is ready.",
    href: "/properties/new",
    cta: "List property",
  },
];

const stats = [
  { label: "Properties listed", value: String(mockAnalytics.propertiesListed) },
  { label: "Monthly visitors", value: "1,200" },
  { label: "Active agents", value: String(mockAnalytics.activeAgents) },
  { label: "Verified listings", value: String(mockAnalytics.verifiedListings) },
];

const steps = [
  {
    number: "01",
    title: "Search",
    description: "Find the property type that matches your plan, from shortlets to land.",
  },
  {
    number: "02",
    title: "Apply",
    description: "Show interest, request a viewing, and submit your application from one flow.",
  },
  {
    number: "03",
    title: "Verify",
    description: "RealityNG prepares the path for identity, agent, and property due diligence.",
  },
  {
    number: "04",
    title: "Approve",
    description:
      "Track decisions and next actions from your buyer, agent, landlord, or admin dashboard.",
  },
];

const artisanSolutions = [
  {
    title: "Verified service profiles",
    description:
      "A clear path for plumbers, electricians, painters, cleaners, and finishing specialists to present trusted property services.",
  },
  {
    title: "Property-owner matching",
    description:
      "Designed to help owners and agents find reliable artisans around active rentals, shortlets, and managed properties.",
  },
  {
    title: "Future booking readiness",
    description:
      "The experience is prepared for quotes, bookings, reviews, and verified artisan badges in the approved roadmap.",
  },
];

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85",
    label: "Verified family homes",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85",
    label: "Gallery-first apartments",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85",
    label: "Diaspora-ready discovery",
  },
  {
    src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=85",
    label: "Approved premium listings",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
    label: "Flexible rentals and sharing",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=2200&q=85",
    label: "Curated property galleries",
  },
  {
    src: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=2200&q=85",
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
    <div className="min-h-screen bg-brand-background pb-28 text-brand-text lg:pb-0">
      <Navbar />
      <main>
        <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden">
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
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,21,0.96)_0%,rgba(8,28,21,0.82)_45%,rgba(8,28,21,0.34)_82%,rgba(8,28,21,0.62)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,21,0.32)_0%,rgba(8,28,21,0.08)_48%,rgba(8,28,21,0.9)_100%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col justify-center px-5 py-14 sm:px-6 lg:py-20">
            <div className="max-w-3xl">
              <BrandLogo
                className="h-20 w-auto object-contain drop-shadow-[0_8px_26px_rgba(0,0,0,0.55)] sm:h-24"
                priority
                showTagline
                taglineClassName="mt-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-brand-secondary sm:text-xs"
              />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 sm:text-sm">
                Trusted Nigerian property discovery
              </p>
              <h1
                className="mt-5 max-w-4xl font-heading text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl"
                style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
              >
                Find your place in Nigeria with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                Browse approved homes, land, commercial spaces, and apartment shares with clear
                galleries, useful filters, and one simple path into your RealityNG dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/properties">
                  Browse properties
                </Link>
                <Link
                  className={buttonClasses(
                    "secondary",
                    "w-full border-white/70 text-white sm:w-auto",
                  )}
                  href="/auth/sign-up"
                >
                  Create free account
                </Link>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white/85">{heroSlides[activeSlide].label}</p>
              <div className="flex gap-2" role="tablist" aria-label="Featured property slideshow">
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

        <section
          id="overview"
          aria-labelledby="property-search-title"
          className="border-y border-white/10 bg-white"
        >
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
            <div className="mb-5">
              <h2
                className="font-heading text-2xl font-semibold text-brand-background"
                id="property-search-title"
              >
                Start your property search
              </h2>
              <p className="mt-1 text-sm text-[#52675f]">
                Choose a city and listing type, then refine the results on the browse page.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <Input
                aria-label="Search city"
                className="border-black/15 bg-black/5 text-brand-background placeholder:text-[#61736c]"
                onChange={(event) => setCity(event.target.value)}
                placeholder="Search by city"
                value={city}
              />
              <Select
                aria-label="Listing type"
                className="border-black/15 bg-black/5 text-brand-background"
                onChange={(event) => setListingType(event.target.value)}
                value={listingType}
              >
                <option value="">Any listing type</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="apartment_share">Apartment share</option>
              </Select>
              <Button className="w-full lg:w-auto" onClick={searchProperties}>
                Search properties
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" id="products">
          <SectionHeader
            description="After creating your profile, choose the path that fits your role and goal."
            eyebrow="Your next move"
            title="Browse or list from one starting point"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {actionCards.map((action) => (
              <Card className="flex h-full flex-col justify-between p-6" key={action.title}>
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-brand-text">
                    {action.title}
                  </h3>
                  <p className="mt-3 leading-7 text-brand-muted">{action.description}</p>
                </div>
                <Link
                  className={buttonClasses(
                    action.title === "Browse property" ? "primary" : "secondary",
                    "mt-6 w-full sm:w-fit",
                  )}
                  href={action.href}
                >
                  {action.cta}
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6">
          <SectionHeader
            description="Move directly into the property goal that fits your plans."
            eyebrow="Property categories"
            title="What are you looking for?"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link className="group" href={category.href} key={category.label}>
                <Card className="h-full p-5 transition group-hover:border-brand-secondary/60 group-focus-visible:ring-2 group-focus-visible:ring-brand-secondary">
                  <h3 className="font-heading text-xl font-semibold text-brand-text">
                    {category.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{category.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                description="Explore standout approved listings and begin building your shortlist."
                eyebrow="Featured properties"
                title="Homes worth a closer look"
              />
              <Link className="text-sm font-semibold text-brand-secondary" href="/properties">
                View all properties
              </Link>
            </div>
            {featuredQuery.isLoading ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div className="h-96 animate-pulse rounded-md bg-white/10" key={item} />
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
              <Card className="mt-8 p-8 text-brand-muted">
                Featured properties will appear here.
              </Card>
            ) : null}
          </div>
        </section>

        <section className="bg-brand-primary" id="who-we-are">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                Who we are
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-white sm:text-4xl">
                A Nigerian property platform built around trust, access, and role-based journeys.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div className="border-l border-brand-secondary/60 pl-5" key={stat.label}>
                  <p className="font-heading text-4xl font-semibold text-brand-secondary">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-brand-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
          <SectionHeader
            description="A clear transaction path from discovery to the next approved step."
            eyebrow="How it works"
            title="Search, apply, verify, approve"
          />
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {steps.map((step) => (
              <div className="border-t border-brand-secondary/50 pt-5" key={step.number}>
                <p className="text-sm font-semibold text-brand-secondary">{step.number}</p>
                <h3 className="mt-4 font-heading text-2xl font-semibold text-brand-text">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-brand-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55" id="artisans">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <SectionHeader
                description="RealityNG is expanding property support beyond listings so owners, renters, agents, and diaspora investors can find trusted help when a property needs work."
                eyebrow="Solutions for artisans"
                title="A future-ready service layer for property care"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {artisanSolutions.map((solution) => (
                  <Card className="h-full p-5" key={solution.title}>
                    <h3 className="font-heading text-xl font-semibold text-brand-text">
                      {solution.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-brand-muted">
                      {solution.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
                Your RealityNG journey
              </p>
              <h2 className="mt-3 max-w-3xl font-heading text-3xl font-semibold text-brand-background sm:text-4xl">
                Save your shortlist and continue with a dashboard built around your role.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={buttonClasses("primary", "w-full sm:w-auto")} href="/auth/sign-up">
                Create account
              </Link>
              <Link
                className={buttonClasses(
                  "secondary",
                  "w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10 sm:w-auto",
                )}
                href="/properties"
              >
                Keep browsing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
