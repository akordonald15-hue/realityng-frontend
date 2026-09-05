"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { useRoleSelection } from "@/components/auth/role-selection-modal";
import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";
import { PublicShell } from "@/components/layout/public-shell";
import { StaggerReveal } from "@/components/motion/stagger-reveal";
import { PropertyCard } from "@/components/properties/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { getPublicProperties, propertyTypeOptions } from "@/lib/api/properties";
import type { ListingType, Property, PropertyFilters } from "@/lib/api/properties";
import { gsap, registerGsapPlugins, useGSAP } from "@/lib/motion/gsap";
import { heroReveal, imageSettle } from "@/lib/motion/presets";
import { organizationJsonLd, websiteSearchJsonLd } from "@/lib/seo";

const propertyModes: Array<{ label: string; value: ListingType }> = [
  { label: "For Rent", value: "rent" },
  { label: "For Sale", value: "sale" },
];

const priceOptions = [
  { label: "Any price", value: "" },
  { label: "Up to NGN 1m", value: "1000000" },
  { label: "Up to NGN 5m", value: "5000000" },
  { label: "Up to NGN 20m", value: "20000000" },
  { label: "Up to NGN 100m", value: "100000000" },
];

const trustItems = [
  { label: "Reviewed property listings", icon: ListCheckIcon },
  { label: "Verified customers, agents & landlords", icon: VerifiedCheckIcon },
  { label: "Secure & private documents", icon: ShieldUserIcon },
];

const steps = [
  {
    title: "Search",
    mobileTitle: "Search",
    description: "Explore properties by location, type, and price",
    icon: CompassIcon,
    href: "/properties",
  },
  {
    title: "Inspection",
    mobileTitle: "Save",
    description: "Found the right one? Get in touch and arrange a viewing.",
    icon: SearchIcon,
    href: "/properties",
  },
  {
    title: "Apply",
    mobileTitle: "Book a viewing",
    description: "Save the properties you like and come back to them later.",
    icon: FileCheckIcon,
    href: "/properties",
  },
  {
    title: "Payment",
    mobileTitle: "Keep track",
    description: "Keep your property activity organized in one place.",
    icon: ChecklistIcon,
    href: "/dashboard",
  },
];

const cities = [
  { city: "Lagos", areas: "Lekki, Ikoyi, Victoria Island, Yaba, Ikeja" },
  {
    city: "Abuja",
    areas: "Maitama, Wuse, Jabi, Gwarinpa, Asokoro",
    imageSrc: "/home/city-abuja.png",
  },
  {
    city: "Port Harcourt",
    areas: "Old GRA, Trans Amadi, Peter Odili Road",
    imageSrc: "/home/city-port-harcourt.png",
  },
  { city: "Uyo", areas: "Ewet Housing, Shelter Afrique, Ring Road" },
  { city: "Enugu", areas: "Independence Layout, New Haven, GRA" },
  { city: "Ibadan", areas: "Jericho, Bodija, Akobo, Oluyole" },
];

const roleCards = [
  {
    title: "Property owners",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "List your property",
    tone: "secondary",
    icon: BuildingsIcon,
    nextPath: "/properties/new",
  },
  {
    title: "Agents",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "List your property",
    tone: "primary",
    icon: UsersIcon,
    nextPath: "/properties/new",
  },
  {
    title: "For Artisan",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "Get Started",
    tone: "neutral",
    icon: ToolsIcon,
    nextPath: "/services",
  },
];

function buildPropertyUrl(filters: PropertyFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return `/properties${params.toString() ? `?${params.toString()}` : ""}`;
}

function SectionHeading({
  align = "left",
  eyebrow,
  subtitle,
  title,
}: {
  align?: "left" | "center";
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-[870px] text-center" : "max-w-[870px] text-left"
      }
    >
      {eyebrow ? (
        <p className="mb-4 text-lg font-medium leading-7 text-reality-brand-500">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-[2rem] font-medium leading-none tracking-normal text-black md:text-[3.75rem] md:leading-[1.2]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-7 text-reality-text-muted md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<ListingType>("rent");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function submitSearch() {
    router.push(
      buildPropertyUrl({
        city: city.trim(),
        listing_type: mode,
        max_price: maxPrice,
        property_type: propertyType,
      }),
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6" data-testid="hero-search">
      <SegmentedTabs
        className="gap-4 bg-transparent p-0"
        items={propertyModes}
        label="Property listing type"
        onChange={(value) => setMode(value as ListingType)}
        value={mode}
      />
      <div className="grid w-full gap-1 rounded-[2rem] bg-[#062820] p-1 shadow-reality-xs md:h-16 md:grid-cols-[1fr_1fr_1fr_56px] md:rounded-full">
        <SearchField icon={MapPinIcon} label="Location">
          <Input
            aria-label="Search location"
            className="h-5 border-0 bg-transparent p-0 text-sm text-white placeholder:text-white/60 focus:ring-0"
            onChange={(event) => setCity(event.target.value)}
            placeholder="Where"
            value={city}
          />
        </SearchField>
        <SearchField icon={BuildingsIcon} label="Type">
          <Select
            aria-label="Property type"
            className="h-5 border-0 bg-transparent p-0 text-sm text-white/60 focus:ring-0"
            onChange={(event) => setPropertyType(event.target.value)}
            value={propertyType}
          >
            <option value="">Any type</option>
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </SearchField>
        <SearchField icon={BanknoteIcon} label="Price range">
          <Select
            aria-label="Maximum price"
            className="h-5 border-0 bg-transparent p-0 text-sm text-white/60 focus:ring-0"
            onChange={(event) => setMaxPrice(event.target.value)}
            value={maxPrice}
          >
            {priceOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </SearchField>
        <Button
          aria-label="Search properties"
          className="h-14 rounded-full bg-[#c99a3d] px-6 text-white hover:bg-[#bc8936] md:size-14 md:px-0"
          onClick={submitSearch}
          variant="reality"
        >
          <SearchIcon className="size-4" />
          <span className="ml-2 md:sr-only">Search</span>
        </Button>
      </div>
    </div>
  );
}

function SearchField({
  children,
  icon: Icon,
  label,
}: {
  children: React.ReactNode;
  icon: IconComponent;
  label: string;
}) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-full bg-[#0a3b2e] px-4 text-left shadow-reality-xs backdrop-blur">
      <Icon className="size-4 shrink-0 text-white" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-xs font-medium leading-[18px] text-white">{label}</span>
        {children}
      </span>
    </label>
  );
}

function PropertyRail({
  ctaLabel,
  properties,
  subtitle,
  title,
}: {
  ctaLabel?: string;
  properties: Property[];
  subtitle: string;
  title: string;
}) {
  return (
    <section>
      <div className="mb-8 flex items-start justify-between gap-5 md:mb-14">
        <div>
          <h2 className="font-display text-[2rem] font-medium leading-none text-black md:text-[3.75rem] md:leading-none">
            <Link className="group inline-flex items-center gap-3" href="/properties">
              {title}
              <span className="hidden size-10 items-center justify-center rounded-full bg-reality-bg-muted text-black transition group-hover:bg-reality-brand-50 md:inline-flex">
                <ArrowRightIcon className="size-5" />
              </span>
            </Link>
          </h2>
          <p className="mt-3 text-base leading-7 text-reality-text-muted">{subtitle}</p>
        </div>
      </div>
      {properties.length > 0 ? (
        <StaggerReveal
          className="-mx-6 flex snap-x gap-6 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0"
          stagger={0.05}
          y={14}
        >
          {properties.map((property) => (
            <div className="snap-start" data-motion-child key={property.id}>
              <PropertyCard property={property} variant="reality" />
            </div>
          ))}
        </StaggerReveal>
      ) : (
        <div className="rounded-[2rem] bg-reality-bg-muted p-8 text-reality-text-muted">
          Approved public listings will appear here when inventory is available.
        </div>
      )}
      {ctaLabel ? (
        <Link className={buttonClasses("reality", "mt-6 w-full md:hidden")} href="/properties">
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}

function CityCard({
  areas,
  city,
  imageSrc,
  index,
}: {
  areas: string;
  city: string;
  imageSrc?: string;
  index: number;
}) {
  return (
    <Link
      className="group relative block h-[317px] w-[321px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-[#0a3b2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 md:w-auto"
      href={`/properties?city=${encodeURIComponent(city)}`}
    >
      {imageSrc ? (
        <Image
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(min-width: 768px) 426px, 321px"
          src={imageSrc}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,#0a3b2e,#118a64)] opacity-95"
          style={{ filter: `hue-rotate(${index * 18}deg)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
      <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/60 text-black backdrop-blur">
        <ArrowUpRightIcon className="size-6" />
      </span>
      <div className="absolute inset-x-6 bottom-6 text-center text-white">
        <h3 className="text-xl font-semibold leading-7">{city}</h3>
        <p className="mt-0.5 text-base leading-6 text-white/80">{areas}</p>
      </div>
    </Link>
  );
}

function RoleCard({
  card,
  onSelect,
}: {
  card: (typeof roleCards)[number];
  onSelect: (nextPath: string) => void;
}) {
  const Icon = card.icon;
  const toneClass =
    card.tone === "secondary"
      ? "bg-[#f9f6ed]"
      : card.tone === "primary"
        ? "bg-[#edfcf5]"
        : "bg-reality-bg-muted";

  return (
    <article
      className={`${toneClass} flex min-h-[298px] flex-col items-center justify-between rounded-[2rem] p-6 text-center md:min-h-[335px]`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-white md:size-[93px]">
          <Icon className="size-6 text-black md:size-8" />
        </div>
        <div className="max-w-[247px]">
          <h3 className="text-2xl font-medium leading-8 text-black">{card.title}</h3>
          <p className="mt-3 text-xs leading-[18px] text-black">{card.description}</p>
        </div>
      </div>
      <Button
        className="mt-6 h-12 px-[18px]"
        onClick={() => onSelect(card.nextPath)}
        variant="reality"
      >
        {card.button}
      </Button>
    </article>
  );
}

export default function HomePage() {
  const { openRoleSelection } = useRoleSelection();
  const heroScope = useRef<HTMLElement>(null);
  const featuredQuery = useQuery({
    queryKey: ["homepage-featured-properties"],
    queryFn: () => getPublicProperties({ ordering: "-featured" }),
  });
  const latestQuery = useQuery({
    queryKey: ["homepage-latest-properties"],
    queryFn: () => getPublicProperties({ ordering: "-created_at" }),
  });

  const featured = useMemo(
    () => featuredQuery.data?.results.slice(0, 4) ?? [],
    [featuredQuery.data],
  );
  const latest = useMemo(
    () => (latestQuery.data?.results ?? featuredQuery.data?.results ?? []).slice(0, 4),
    [featuredQuery.data, latestQuery.data],
  );

  function handleRoleSelect(nextPath: string) {
    openRoleSelection({
      actionLabel: "Create account",
      nextPath,
    });
  }

  useGSAP(
    () => {
      registerGsapPlugins();

      if (process.env.NODE_ENV === "test") {
        return;
      }

      const hero = heroScope.current;
      if (!hero) {
        return;
      }

      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]", hero);
      const heroImage = hero.querySelector<HTMLElement>("[data-hero-image]");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set([...heroItems, heroImage].filter(Boolean), {
          autoAlpha: 1,
          clearProps: "transform",
        });
        return;
      }

      gsap
        .timeline({ defaults: { ease: heroReveal.to.ease } })
        .fromTo(heroImage, imageSettle.from, imageSettle.to, 0)
        .fromTo(
          heroItems,
          heroReveal.from,
          {
            ...heroReveal.to,
            stagger: 0.08,
          },
          0.08,
        );
    },
    { scope: heroScope },
  );

  return (
    <div className="min-h-screen bg-white font-body text-reality-text-primary">
      <JsonLd data={organizationJsonLd()} id="realityng-organization-jsonld" />
      <JsonLd data={websiteSearchJsonLd()} id="realityng-website-jsonld" />
      <PublicShell transparentHeader variant="reality">
        <main>
          <section
            className="relative flex min-h-[956px] items-start justify-center overflow-hidden px-6 pb-12 pt-[167px] md:min-h-[1080px] md:px-0 md:pt-[289px]"
            ref={heroScope}
          >
            <Image
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              data-hero-image
              fill
              priority
              sizes="100vw"
              src="/home/hero-house.png"
            />
            <div className="absolute inset-0 -z-10 bg-[#0a3b2e]/60" />
            <div className="relative z-10 flex w-full max-w-[1066px] flex-col items-center gap-10 text-center text-white md:gap-[35px]">
              <div className="max-w-[725px]" data-hero-reveal>
                <h1 className="font-display text-[3.75rem] font-semibold leading-none tracking-normal md:text-[4.5rem] md:leading-[90px]">
                  Find property in Nigeria with confidence.
                </h1>
                <p className="mt-3 text-base leading-6">
                  Search verified homes, shortlets, land, and commercial spaces.
                </p>
              </div>
              <div className="w-full">
                <HeroSearch />
              </div>
            </div>
            <div
              className="pointer-events-none absolute bottom-12 left-1/2 grid w-[334px] -translate-x-1/2 grid-cols-3 gap-3 text-left md:bottom-[125px] md:flex md:w-auto md:gap-8"
              data-hero-reveal
            >
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="flex flex-col gap-2.5 text-white" key={item.label}>
                    <Icon className="size-5 md:size-6" />
                    <p className="text-xs font-medium leading-[18px] md:w-[146px] md:text-base md:leading-6">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="reality-reveal mx-auto flex max-w-reality flex-col gap-16 px-6 py-14 md:gap-[88px] md:px-0 md:py-20">
            <section>
              <SectionHeading
                align="center"
                eyebrow="How it works"
                subtitle="Browse, save, book a viewing, and keep track of everything in one place."
                title="Find a property and take the next step"
              />
              <StaggerReveal
                className="mt-8 grid grid-cols-2 gap-4 md:mt-12 md:grid-cols-4 md:gap-6"
                stagger={0.05}
                y={14}
              >
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Link
                      className="group rounded-[2rem] bg-reality-bg-muted p-4 transition hover:bg-reality-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 md:p-8"
                      data-motion-child
                      href={step.href}
                      key={step.title}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="size-6 text-black" />
                        <ArrowUpRightIcon className="hidden size-5 text-black transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
                      </div>
                      <h3 className="mt-4 text-base font-medium leading-6 text-black md:text-xl md:leading-7">
                        <span className="md:hidden">{step.mobileTitle}</span>
                        <span className="hidden md:inline">{step.title}</span>
                      </h3>
                      <p className="mt-1 text-xs leading-[18px] text-black md:mt-2 md:text-sm md:leading-5">
                        {step.description}
                      </p>
                    </Link>
                  );
                })}
              </StaggerReveal>
            </section>

            {featuredQuery.isLoading ? (
              <RailSkeleton title="Featured properties" />
            ) : (
              <PropertyRail
                ctaLabel="View all properties"
                properties={featured}
                subtitle="Explore reviewed homes, land, and commercial spaces."
                title="Featured properties"
              />
            )}

            {latestQuery.isLoading ? (
              <RailSkeleton title="Newly added properties" />
            ) : (
              <PropertyRail
                properties={latest}
                subtitle="Fresh listings from the public RealityNG marketplace."
                title="Newly added properties"
              />
            )}

            <section>
              <SectionHeading
                align="center"
                subtitle="Explore popular locations across Nigeria and refine your search from there."
                title="Browse by city"
              />
              <StaggerReveal
                className="-mx-6 mt-8 flex snap-x gap-6 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-3 md:px-0"
                stagger={0.05}
                y={14}
              >
                {cities.map((city, index) => (
                  <div data-motion-child key={city.city}>
                    <CityCard
                      areas={city.areas}
                      city={city.city}
                      imageSrc={city.imageSrc}
                      index={index}
                    />
                  </div>
                ))}
              </StaggerReveal>
            </section>

            <section>
              <SectionHeading
                align="center"
                subtitle="Whether you own properties, help people find them, or provide essential services, RealityNG gives you the tools to get things done with confidence."
                title="Everything you need to make property easier"
              />
              <StaggerReveal
                className="mt-8 grid gap-5 md:mt-14 md:grid-cols-3"
                stagger={0.05}
                y={14}
              >
                {roleCards.map((card) => (
                  <div data-motion-child key={card.title}>
                    <RoleCard card={card} onSelect={handleRoleSelect} />
                  </div>
                ))}
              </StaggerReveal>
            </section>

            <StaggerReveal
              className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-reality-brand-600 px-8 py-12 md:min-h-[717px] md:rounded-[3.5rem] md:px-[130px]"
              stagger={0.06}
              y={18}
            >
              <Image
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                fill
                sizes="(min-width: 768px) 1328px, 100vw"
                src="/home/cta-businessman.png"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-reality-brand-600 via-reality-brand-600/70 to-transparent mix-blend-multiply" />
              <div
                className="relative flex min-h-[420px] max-w-[374px] flex-col justify-center text-white md:min-h-[620px]"
                data-motion-child
              >
                <h2 className="font-display text-[3.5rem] font-medium leading-[1.05] tracking-normal md:text-[4.5rem] md:leading-[79px]">
                  Found somewhere you like?
                </h2>
                <p className="mt-4 text-lg font-medium leading-7">
                  Create an account to save properties, book viewings, and keep track of the ones
                  you are interested in.
                </p>
                <button
                  className={buttonClasses("realitySecondary", "mt-6 h-12 w-fit px-[18px]")}
                  onClick={() =>
                    openRoleSelection({
                      actionLabel: "Create account",
                      nextPath: "/onboarding/role-setup",
                    })
                  }
                  type="button"
                >
                  Get Started
                </button>
              </div>
            </StaggerReveal>
          </div>
        </main>
      </PublicShell>
      <PublicAssistantWidget />
    </div>
  );
}

function RailSkeleton({ title }: { title: string }) {
  return (
    <section aria-label={`${title} loading`}>
      <div className="h-20 max-w-lg animate-pulse rounded-[1rem] bg-reality-bg-muted" />
      <div className="mt-12 flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((item) => (
          <div
            className="h-[392px] w-[314px] shrink-0 animate-pulse rounded-[2rem] bg-reality-bg-muted"
            key={item}
          />
        ))}
      </div>
    </section>
  );
}

type IconComponent = (props: { className?: string }) => React.ReactElement;

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 20 20">
      <path
        d="M4.167 10h11.666m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M7 17 17 7m0 0H9m8 0v8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M8 14s4.5-3.8 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 10.2 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M8 8.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function BuildingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M4 21V7l8-4 8 4v14M8 21v-6h8v6M8 9h.01M12 9h.01M16 9h.01M8 12h.01M12 12h.01M16 12h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function BanknoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M2.5 4.5h11v7h-11v-7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <path
        d="M8 9.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 20 20">
      <path
        d="m14.5 14.5 3 3M16 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FileCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M14 3v5h5M8.5 14l2 2 4-4M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m5 7 1.5 1.5L9 6M11 7h8M5 12l1.5 1.5L9 11M11 12h8M5 17l1.5 1.5L9 16M11 17h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ListCheckIcon({ className }: { className?: string }) {
  return <ChecklistIcon className={className} />;
}

function VerifiedCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m9.2 12.3 1.9 1.9 3.8-4.4M12 22s7-3.4 7-10V5.5L12 3 5 5.5V12c0 6.6 7 10 7 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ShieldUserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 22s7-3.4 7-10V5.5L12 3 5 5.5V12c0 6.6 7 10 7 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9 15c.7-1.2 1.7-1.8 3-1.8s2.3.6 3 1.8M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 18c0-1.8-1.1-3.2-2.7-3.8M16.5 5.2a3 3 0 0 1 0 5.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ToolsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m14.5 5 4.5 4.5M4 20l6.8-6.8M13.5 4 20 10.5l-2.5 2.5L11 6.5 13.5 4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="m5 19 4-1 8.5-8.5-3-3L6 15l-1 4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
