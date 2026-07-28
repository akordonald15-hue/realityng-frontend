"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useRoleSelection } from "@/components/auth/role-selection-modal";
import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PropertyCard } from "@/components/properties/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { getPublicProperties } from "@/lib/api/properties";
import type { PropertyFilters } from "@/lib/api/properties";
import { organizationJsonLd, websiteSearchJsonLd } from "@/lib/seo";

const searchGoals: Array<{
  label: string;
  filters: PropertyFilters;
  helper: string;
}> = [
  {
    label: "Buy",
    filters: { listing_type: "sale" },
    helper: "Homes, land, hotels, and commercial assets for purchase.",
  },
  {
    label: "Rent",
    filters: { listing_type: "rent" },
    helper: "Apartments, homes, offices, and flexible rentals.",
  },
  {
    label: "Shortlets",
    filters: { property_type: "shortlet" },
    helper: "Serviced stays and hospitality-ready apartments.",
  },
  {
    label: "Share",
    filters: { listing_type: "apartment_share" },
    helper: "Shared apartments and rooms for flexible city living.",
  },
  {
    label: "Land",
    filters: { property_type: "land" },
    helper: "Residential and investment land in Nigerian growth markets.",
  },
  {
    label: "Commercial",
    filters: { property_type: "commercial" },
    helper: "Offices, shops, warehouses, hotels, and income properties.",
  },
];

const categories = [
  {
    label: "Hotels and shortlets",
    href: "/properties?property_type=shortlet",
    description: "Fast-moving stays, serviced apartments, and hospitality-ready listings.",
  },
  {
    label: "Apartment sharing",
    href: "/properties?listing_type=apartment_share",
    description: "Shared homes and available rooms for flexible city living.",
  },
  {
    label: "Apartments",
    href: "/properties?property_type=apartment",
    description: "City apartments for rent, purchase, and long-term relocation.",
  },
  {
    label: "Family homes",
    href: "/properties?property_type=house",
    description: "Houses and duplexes suited to families and long-term ownership.",
  },
  {
    label: "Land",
    href: "/properties?property_type=land",
    description: "Residential and investment land across established markets.",
  },
  {
    label: "Commercial",
    href: "/properties?property_type=commercial",
    description: "Office, retail, hospitality, and income-producing opportunities.",
  },
];

const popularLocations = [
  { city: "Lagos", description: "Lekki, Ikoyi, Victoria Island, Yaba, Ikeja" },
  { city: "Abuja", description: "Maitama, Wuse, Jabi, Gwarinpa, Asokoro" },
  { city: "Port Harcourt", description: "Old GRA, Trans Amadi, Peter Odili Road" },
  { city: "Uyo", description: "Ewet Housing, Shelter Afrique, Ring Road" },
  { city: "Enugu", description: "Independence Layout, New Haven, GRA" },
  { city: "Ibadan", description: "Jericho, Bodija, Akobo, Oluyole" },
];

const verificationItems = [
  {
    title: "Listing review",
    description:
      "Approved listings pass through RealityNG review before they are shown in public browsing.",
  },
  {
    title: "Representative accountability",
    description:
      "Agent, landlord, and artisan verification workflows help users understand who is behind an opportunity.",
  },
  {
    title: "Document-aware workflows",
    description:
      "Private verification documents stay protected while approved trust signals can be shown to users.",
  },
  {
    title: "Clear next steps",
    description:
      "Inquiries, viewings, and applications are tracked so each property journey has a visible status.",
  },
];

const professionalPaths = [
  {
    title: "For buyers and renters",
    description:
      "Browse first, save when ready, then move into inquiries, viewings, and applications with your history preserved.",
  },
  {
    title: "For landlords and agents",
    description:
      "Create listings, manage leads, respond to viewing requests, and follow rental applications from one dashboard.",
  },
  {
    title: "For verified professionals",
    description:
      "Verification workflows prepare RealityNG for more accountable agents, landlords, and property service providers.",
  },
];

const guideCards = [
  {
    title: "How verification works",
    description: "Understand what RealityNG checks, what remains limited, and why trust signals matter.",
    href: "#verification",
  },
  {
    title: "How to request a viewing",
    description: "Use Show Interest first, then request a physical or virtual viewing when the property fits.",
    href: "#how-it-works",
  },
  {
    title: "Browse by location",
    description: "Start with a city now, then refine by property type, listing type, and price range.",
    href: "#locations",
  },
];

const steps = [
  {
    number: "01",
    title: "Search",
    description: "Browse approved listings by city, property goal, type, and price before signing up.",
  },
  {
    number: "02",
    title: "Shortlist",
    description: "Create an account only when you want to save, compare, inquire, or track a property.",
  },
  {
    number: "03",
    title: "Engage",
    description: "Show interest, request a viewing, or begin an application through structured workflows.",
  },
  {
    number: "04",
    title: "Track",
    description: "Use your dashboard to follow inquiries, viewings, applications, and verification status.",
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
  const { openRoleSelection } = useRoleSelection();
  const [location, setLocation] = useState("");
  const [activeGoal, setActiveGoal] = useState(searchGoals[0]);
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

  function searchProperties(overrides: PropertyFilters = {}) {
    const params = new URLSearchParams();
    const filters: PropertyFilters = {
      ...activeGoal.filters,
      ...overrides,
    };

    if (location.trim()) {
      params.set("city", location.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/properties${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="min-h-screen bg-brand-background pb-28 text-brand-text lg:pb-0">
      <JsonLd data={organizationJsonLd()} id="realityng-organization-jsonld" />
      <JsonLd data={websiteSearchJsonLd()} id="realityng-website-jsonld" />
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-brand-background">
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
            <div className="absolute inset-0 bg-black/36" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,39,31,0.12)_0%,rgba(6,39,31,0.25)_48%,rgba(6,39,31,0.5)_100%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[31rem] max-w-7xl flex-col justify-center px-5 py-12 sm:min-h-[34rem] sm:px-6 lg:min-h-[35rem]">
            <div className="max-w-3xl">
              <h1
                className="max-w-2xl font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-[3.4rem]"
                style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
              >
                Find property in Nigeria with confidence.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
                Search verified homes, shortlets, land, and commercial spaces.
              </p>
            </div>

            <div
              aria-labelledby="property-search-title"
              className="mt-7 w-full max-w-[42rem] text-brand-main"
              id="overview"
            >
              <div
                className="flex flex-wrap items-end gap-0"
                role="tablist"
                aria-label="Property goals"
              >
                {searchGoals.map((goal) => (
                  <button
                    aria-selected={activeGoal.label === goal.label}
                    className={
                      activeGoal.label === goal.label
                        ? "min-h-11 rounded-t-md bg-white px-4 py-2.5 text-sm font-bold text-brand-main shadow-[0_-5px_18px_rgba(0,0,0,0.12)]"
                        : "min-h-11 rounded-t-md border border-white/50 bg-white/82 px-4 py-2.5 text-sm font-medium text-brand-main backdrop-blur transition hover:bg-white"
                    }
                    key={goal.label}
                    onClick={() => setActiveGoal(goal)}
                    role="tab"
                    type="button"
                  >
                    {goal.label}
                  </button>
                ))}
              </div>

              <div className="flex rounded-b-md rounded-tr-md bg-white p-2 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
                <Input
                  aria-label="Search city or area"
                  className="h-14 flex-1 border-0 bg-white px-4 text-base text-brand-main placeholder:text-[#61736c] focus:ring-0"
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, area, estate, or landmark"
                  value={location}
                />
                <Button
                  aria-label="Search properties"
                  className="h-14 w-14 shrink-0 rounded-md px-0 text-xl sm:w-16"
                  onClick={() => searchProperties()}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16.5 16.5 4 4" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/82">
                {heroSlides[activeSlide].label}
              </p>
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

        <section className="border-y border-white/10 bg-brand-surface/55">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                description="Live approved listings from RealityNG, shown before account creation so users can evaluate real marketplace value."
                eyebrow="Featured verified properties"
                title="Start with listings worth a closer look"
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
                Approved featured listings will appear here when inventory is available.
              </Card>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" id="products">
          <SectionHeader
            description="Move directly into the property goal that fits your plans."
            eyebrow="Browse by property goal"
            title="Choose the way you want to search"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <section className="border-y border-white/10 bg-white" id="locations">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <SectionHeader
              description="Start with major Nigerian cities today. Area, LGA, estate, and landmark search can deepen as location data matures."
              eyebrow="Browse by city"
              title="Explore Nigerian property markets"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularLocations.map((locationOption) => (
                <Link
                  className="group rounded-md border border-black/10 bg-brand-warm p-5 text-brand-main transition hover:border-brand-secondary"
                  href={`/properties?city=${encodeURIComponent(locationOption.city)}`}
                  key={locationOption.city}
                >
                  <h3 className="font-heading text-2xl font-semibold">{locationOption.city}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#52675f]">
                    {locationOption.description}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-brand-primary group-hover:text-brand-secondary">
                    View listings
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" id="verification">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHeader
              description="RealityNG should not simply say a listing is trusted. It should show which checks are available, what was reviewed, and where limitations remain."
              eyebrow="Trust layer"
              title="Verification should be visible, specific, and honest"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {verificationItems.map((item) => (
                <Card className="h-full p-5" key={item.title}>
                  <h3 className="font-heading text-xl font-semibold text-brand-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55" id="who-we-are">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <SectionHeader
              description="The platform supports the people who create the marketplace, without hiding core property discovery behind an account wall."
              eyebrow="Role-based marketplace"
              title="Different users, one transaction path"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {professionalPaths.map((path) => (
                <Card className="h-full p-6" key={path.title}>
                  <h3 className="font-heading text-2xl font-semibold text-brand-text">
                    {path.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{path.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" id="diaspora">
          <div className="grid gap-8 rounded-md border border-white/10 bg-brand-primary p-6 sm:p-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                Diaspora support
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-white sm:text-4xl">
                Browse from anywhere, then move carefully when a property is worth action.
              </h2>
            </div>
            <p className="text-base leading-8 text-brand-muted">
              RealityNG is designed for people who need clearer property information before they
              travel, call an agent, or ask family to inspect a place. Public discovery stays open;
              account creation begins when a user wants to save, inquire, view, apply, or list.
            </p>
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55" id="how-it-works">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <SectionHeader
              description="A clear transaction path from discovery to the next approved step."
              eyebrow="How it works"
              title="Search, shortlist, engage, track"
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
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" id="guides">
          <SectionHeader
            description="Educational entry points help users understand the marketplace before they create an account."
            eyebrow="Guides and local intelligence"
            title="Make better property decisions"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {guideCards.map((guide) => (
              <Link className="group" href={guide.href} key={guide.title}>
                <Card className="h-full p-6 transition group-hover:border-brand-secondary/60">
                  <h3 className="font-heading text-2xl font-semibold text-brand-text">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-brand-muted">{guide.description}</p>
                  <p className="mt-5 text-sm font-semibold text-brand-secondary">Read more</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-brand-surface/55" id="artisans">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <SectionHeader
                description="Artisans remain part of the approved roadmap, but the public homepage keeps them as a support layer behind core property discovery."
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

        <section className="border-t border-white/10 bg-white" id="support">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
                Create value when you are ready
              </p>
              <h2 className="mt-3 max-w-3xl font-heading text-3xl font-semibold text-brand-main sm:text-4xl">
                Save your shortlist, request viewings, submit applications, and track everything
                from one account.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className={buttonClasses("primary", "w-full sm:w-auto")}
                onClick={() =>
                  openRoleSelection({
                    actionLabel: "Create account",
                    nextPath: "/onboarding/role-setup",
                  })
                }
                type="button"
              >
                Create account
              </button>
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
      <PublicAssistantWidget />
      <Footer />
    </div>
  );
}
