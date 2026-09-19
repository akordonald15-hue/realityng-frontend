"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PublicShell } from "@/components/layout/public-shell";
import { StaggerReveal } from "@/components/motion/stagger-reveal";
import { PropertyCard } from "@/components/properties/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button, buttonClasses } from "@/components/ui/button";
import { ListboxSelect } from "@/components/ui/listbox-select";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { getPublicProperties, propertyTypeOptions } from "@/lib/api/properties";
import { getAvailablePropertyLocations } from "@/lib/api/available-property-locations";
import type { ListingType, Property, PropertyFilters } from "@/lib/api/properties";
import { USE_MOCKS } from "@/lib/demo-mode";
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
    description: "Explore homes, land, and stays by location, type, and price.",
    imageSrc: "/home/features/search.png",
    href: "/properties",
  },
  {
    title: "Inspection",
    description: "Take a closer look and arrange a viewing that works for you.",
    imageSrc: "/home/features/inspection.png",
    href: "/properties",
  },
  {
    title: "Apply",
    description: "Save a place you love and take the next step with confidence.",
    imageSrc: "/home/features/apply.png",
    href: "/properties",
  },
  {
    title: "Payment",
    description: "Keep your property journey organized in one place.",
    imageSrc: "/home/features/payment.png",
    href: "/dashboard",
  },
];

const cityImagery: Record<string, string> = {
  abuja: "/home/city-abuja.webp",
  "port harcourt": "/home/city-port-harcourt.webp",
};

const roleCards = [
  {
    title: "Property owners",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "List your property",
    tone: "secondary",
    icon: BuildingsIcon,
    nextPath: "/properties/new",
    role: "landlord",
  },
  {
    title: "Agents",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "List your property",
    tone: "primary",
    icon: UsersIcon,
    nextPath: "/properties/new",
    role: "agent",
  },
  {
    title: "For Artisan",
    description:
      "No matter what path you take to market your property, we can help you navigate a successful sale or rent.",
    button: "Get Started",
    tone: "neutral",
    icon: ToolsIcon,
    nextPath: "/services",
    role: "artisan",
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
  motion = false,
  subtitle,
  title,
  tone = "light",
}: {
  align?: "left" | "center";
  eyebrow?: string;
  motion?: boolean;
  subtitle?: string;
  title: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-[870px] text-center" : "max-w-[870px] text-left"
      }
    >
      {eyebrow ? (
        <p className={tone === "dark" ? "mb-4 text-lg font-medium leading-7 text-reality-surfaceBrand" : "mb-4 text-lg font-medium leading-7 text-reality-text-brand"}>{eyebrow}</p>
      ) : null}
      <h2 className={tone === "dark" ? "font-display text-[2rem] font-medium leading-none tracking-normal text-white md:text-[3.75rem] md:leading-[1.2]" : "font-display text-[2rem] font-medium leading-none tracking-normal text-reality-text-primary md:text-[3.75rem] md:leading-[1.2]"} data-motion-child={motion ? "" : undefined}>
        {title}
      </h2>
      {subtitle ? (
        <p className={tone === "dark" ? "mt-4 text-base leading-7 text-white/85 md:text-lg" : "mt-4 text-base leading-7 text-reality-text-secondary md:text-lg"} data-motion-child={motion ? "" : undefined}>{subtitle}</p>
      ) : null}
    </div>
  );
}

function AutoScrollRail({ children, className, label }: { children: React.ReactNode; className: string; label: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => setCanScroll(rail.scrollWidth > rail.clientWidth + 2);
    measure();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(rail);
    window.addEventListener("resize", measure);

    let direction = 1;
    let position = rail.scrollLeft;
    let lastTime = 0;
    let frame = 0;
    let visible = true;
    const visibilityObserver = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 })
      : null;
    visibilityObserver?.observe(rail);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const tick = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
      lastTime = time;
      const maximum = rail.scrollWidth - rail.clientWidth;
      if (visible && !paused && !interactingRef.current && !reducedMotion?.matches && maximum > 2) {
        position = Math.max(0, Math.min(maximum, position + direction * elapsed * 0.025));
        rail.scrollLeft = position;
        if (position >= maximum - 1) direction = -1;
        if (position <= 1) direction = 1;
      } else {
        position = rail.scrollLeft;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [paused]);

  return (
    <div className="relative">
      {canScroll ? (
        <button
          aria-label={`${paused ? "Resume" : "Pause"} ${label} movement`}
          className="absolute -top-10 right-0 rounded-full border border-reality-border-secondary bg-white/90 px-3 py-1 text-xs font-medium text-reality-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          onClick={() => setPaused((current) => !current)}
          type="button"
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
      <div
        aria-label={label}
        className={`reality-no-scrollbar ${className}`}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            interactingRef.current = false;
          }
        }}
        onFocus={() => { interactingRef.current = true; }}
        onMouseEnter={() => { interactingRef.current = true; }}
        onMouseLeave={() => { interactingRef.current = false; }}
        onPointerDown={() => { interactingRef.current = true; }}
        onPointerUp={() => { window.setTimeout(() => { interactingRef.current = false; }, 3500); }}
        ref={railRef}
        role="region"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

function HeroSearch({ onDropdownOpenChange }: { onDropdownOpenChange?: (isOpen: boolean) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<ListingType>("rent");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const locationsQuery = useQuery({
    queryKey: ["available-property-locations"],
    queryFn: getAvailablePropertyLocations,
    staleTime: 5 * 60 * 1000,
  });
  const locationOptions = [
    { label: "All locations", value: "" },
    ...(locationsQuery.data ?? []).map((item) => ({
      label: `${item.name}, ${item.state}`,
      value: JSON.stringify([item.name, item.state]),
    })),
  ];

  function submitSearch() {
    const selected = (locationsQuery.data ?? []).find(
      (item) => JSON.stringify([item.name, item.state]) === location,
    );
    router.push(
      buildPropertyUrl({
        city: selected?.name ?? "",
        state: selected?.state ?? "",
        listing_type: mode,
        max_price: maxPrice,
        property_type: propertyType,
      }),
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6" data-testid="hero-search">
      <div className="grid w-full max-w-[340px] gap-3 md:hidden">
        <ProtectedActionLink
          actionLabel="List property"
          className={buttonClasses("realitySecondary", "reality-hero-invite min-h-14 justify-center border-white bg-white text-base font-bold text-reality-brandEmphasis")}
          href="/properties/new"
          role="landlord"
        >
          List Property
        </ProtectedActionLink>
        <ProtectedActionLink
          actionLabel="Get started"
          className={buttonClasses("reality", "reality-hero-invite reality-hero-invite-delayed min-h-14 justify-center text-base font-bold")}
          href="/dashboard"
        >
          Get Started
        </ProtectedActionLink>
      </div>
      <div className="hidden w-full flex-col items-center gap-6 md:flex">
      <SegmentedTabs
        className="gap-4 bg-transparent p-0"
        items={propertyModes}
        label="Property listing type"
        onChange={(value) => setMode(value as ListingType)}
        value={mode}
      />
      <div className="relative grid w-full overflow-visible rounded-[1.75rem] bg-[#062820]/95 p-1 shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-white/10 backdrop-blur md:h-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_56px] md:rounded-full">
        <SearchField icon={MapPinIcon} label="Location">
          <ListboxSelect
            aria-label="Search location"
            disabled={locationsQuery.isLoading || locationsQuery.isError}
            onChange={setLocation}
            onOpenChange={onDropdownOpenChange}
            options={locationOptions}
            value={location}
          />
        </SearchField>
        <SearchField icon={BuildingsIcon} label="Type">
          <ListboxSelect
            aria-label="Property type"
            onChange={setPropertyType}
            onOpenChange={onDropdownOpenChange}
            options={[
              { label: "Any type", value: "" },
              ...propertyTypeOptions.map((option) => ({
                label: option.label,
                value: option.value,
              })),
            ]}
            value={propertyType}
          />
        </SearchField>
        <SearchField icon={BanknoteIcon} label="Price range">
          <ListboxSelect
            aria-label="Maximum price"
            onChange={setMaxPrice}
            onOpenChange={onDropdownOpenChange}
            options={priceOptions}
            value={maxPrice}
          />
        </SearchField>
        <Button
          aria-label="Search properties"
          className="h-14 w-full rounded-[1.35rem] !border-0 bg-[#0f5d49] px-6 text-white shadow-none ring-0 transition hover:bg-reality-brand-500 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#062820] active:scale-[0.98] md:h-full md:rounded-full md:px-0"
          onClick={submitSearch}
          variant="reality"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="ml-2 md:sr-only">Search</span>
        </Button>
      </div>
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
    <div className="flex h-14 min-w-0 items-center gap-3 rounded-[1.35rem] bg-[#0a3b2e] px-4 text-left transition focus-within:bg-[#0d4637] md:rounded-none md:bg-transparent md:px-6 md:focus-within:bg-white/[0.04] md:[&:not(:last-of-type)]:border-r md:[&:not(:last-of-type)]:border-reality-border-secondary">
      <Icon className="h-4 w-4 shrink-0 text-white" />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-xs font-medium leading-[18px] text-white">{label}</span>
        {children}
      </span>
    </div>
  );
}

function PropertyRail({
  ctaLabel,
  properties,
  surface,
  subtitle,
  title,
}: {
  ctaLabel?: string;
  properties: Property[];
  surface: "muted" | "plain";
  subtitle: string;
  title: string;
}) {
  return (
    <StaggerReveal as="section" className={surface === "muted" ? "rounded-[2rem] bg-reality-surfaceMuted px-5 py-12 md:px-10 md:py-16" : "rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16"} duration={0.76} stagger={0.1} start="top 86%" visibleEntrance y={44}>
      <div className="mb-8 flex items-start justify-between gap-5 md:mb-12">
        <div>
          <h2 className="font-display text-[2rem] font-medium leading-none text-reality-text-primary md:text-[3.75rem] md:leading-none" data-motion-child>
            <Link className="group inline-flex items-center gap-3" href="/properties">
              {title}
              <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-reality-bg-muted text-black transition group-hover:bg-reality-brand-50 md:inline-flex">
                <ArrowRightIcon className="h-5 w-5" />
              </span>
            </Link>
          </h2>
          <p className="mt-3 text-base leading-7 text-reality-text-secondary" data-motion-child>{subtitle}</p>
        </div>
      </div>
      {properties.length > 0 ? (
        <AutoScrollRail className={properties.length < 3 ? "flex justify-start gap-6 overflow-x-auto pb-3 md:justify-center" : "flex gap-6 overflow-x-auto pb-3 2xl:grid 2xl:grid-cols-4 2xl:overflow-visible 2xl:pb-0"} label={title}>
          {properties.map((property) => (
            <div className="w-[min(314px,82vw)] shrink-0" data-motion-child key={property.id}>
              <PropertyCard property={property} variant="reality" />
            </div>
          ))}
          {properties.length < 3 ? (
            <div className="flex min-h-[340px] w-[min(314px,82vw)] shrink-0 flex-col justify-center rounded-[2rem] border border-reality-border-secondary bg-reality-surfaceBrand p-7 md:max-w-[520px] md:flex-1" data-motion-child>
              <p className="font-display text-2xl font-medium leading-tight text-reality-brandEmphasis">Looking for more options?</p>
              <p className="mt-3 text-sm leading-6 text-reality-text-secondary">Browse the full marketplace and refine your search by location, type, or price.</p>
              <Link className={buttonClasses("reality", "mt-6 w-fit")} href="/properties">Browse properties</Link>
            </div>
          ) : null}
        </AutoScrollRail>
      ) : (
        <div className="rounded-[2rem] bg-reality-surfaceBrand p-8 text-reality-text-secondary" data-motion-child>
          <p>Approved public listings will appear here when inventory is available.</p>
          <Link className={buttonClasses("reality", "mt-5 w-fit")} href="/properties">Browse properties</Link>
        </div>
      )}
      {ctaLabel ? (
        <Link className={buttonClasses("reality", "mt-6 w-full md:hidden")} href="/properties">
          {ctaLabel}
        </Link>
      ) : null}
    </StaggerReveal>
  );
}

function CityCard({
  city,
  count,
  imageSrc,
  index,
  state,
}: {
  city: string;
  count: number;
  imageSrc?: string;
  index: number;
  state: string;
}) {
  return (
    <Link
      className="group relative block h-[317px] w-[321px] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-[#0a3b2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 md:w-auto"
      href={`/properties?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />
      <span className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur">
        <ArrowUpRightIcon className="h-6 w-6" />
      </span>
      <div className="absolute inset-x-6 bottom-6 text-center text-white">
        <h3 className="text-xl font-semibold leading-7">{city}</h3>
        <p className="mt-0.5 text-base leading-6 text-white">{state} · {count} {count === 1 ? "listing" : "listings"}</p>
      </div>
    </Link>
  );
}

function RoleCard({
  card,
}: {
  card: (typeof roleCards)[number];
}) {
  const Icon = card.icon;
  const toneClass = card.tone === "primary" ? "bg-reality-surface" : "bg-reality-surfaceMuted";

  return (
    <article
      className={`${toneClass} flex min-h-[298px] flex-col items-center justify-between rounded-[2rem] p-6 text-center md:min-h-[335px]`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white md:h-[93px] md:w-[93px]">
          <Icon className="h-6 w-6 text-black md:h-8 md:w-8" />
        </div>
        <div className="max-w-[247px]">
          <h3 className="text-2xl font-medium leading-8 text-black">{card.title}</h3>
          <p className="mt-3 text-xs leading-[18px] text-black">{card.description}</p>
        </div>
      </div>
      <ProtectedActionLink
        actionLabel={card.button}
        className={buttonClasses("reality", "mt-6 h-12 px-[18px]")}
        href={card.nextPath}
        role={card.role}
      >
        {card.button}
      </ProtectedActionLink>
    </article>
  );
}

export default function HomePage() {
  const heroScope = useRef<HTMLElement>(null);
  const [isHeroFilterOpen, setIsHeroFilterOpen] = useState(false);
  const locationsQuery = useQuery({
    queryKey: ["available-property-locations"],
    queryFn: getAvailablePropertyLocations,
    staleTime: 5 * 60 * 1000,
  });
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
  const latest = useMemo(() => {
    const candidates = (latestQuery.data?.results ?? featuredQuery.data?.results ?? []).slice(0, 4);
    if (featured.length >= 3) return candidates;
    const featuredIds = new Set(featured.map((property) => property.id));
    return candidates.filter((property) => !featuredIds.has(property.id));
  }, [featured, featuredQuery.data, latestQuery.data]);
  const demoCategories = useMemo(() => {
    if (!USE_MOCKS) return null;
    const inventory = featuredQuery.data?.results ?? [];
    return {
      shortlets: inventory.filter((property) => property.property_type === "shortlet").slice(0, 3),
      land: inventory.filter((property) => property.property_type === "land").slice(0, 2),
      hotels: inventory.filter((property) => property.property_type === "hotel").slice(0, 2),
    };
  }, [featuredQuery.data]);

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
    <div className="min-h-screen bg-reality-canvas font-body text-reality-text-primary">
      <JsonLd data={organizationJsonLd()} id="realityng-organization-jsonld" />
      <JsonLd data={websiteSearchJsonLd()} id="realityng-website-jsonld" />
      <PublicShell transparentHeader variant="reality">
        <main>
          <section
            className="relative isolate flex min-h-[700px] flex-col items-center justify-start gap-10 overflow-hidden bg-reality-brand-900 px-5 pb-12 pt-[135px] md:min-h-[820px] md:flex-row md:justify-center md:gap-0 md:px-6 md:pb-44 md:pt-[190px] xl:min-h-[900px] xl:px-0 xl:pt-[220px]"
            ref={heroScope}
          >
            <Image
              alt=""
              className="absolute inset-0 z-0 h-full w-full object-cover"
              data-hero-image
              fill
              priority
              sizes="100vw"
              src="/home/hero-house.webp"
            />
            <div className="absolute inset-0 z-0 bg-[#0a3b2e]/60" />
            <div className="relative z-10 flex w-full max-w-[1066px] flex-col items-center gap-8 text-center text-white md:gap-[35px]">
              <div className="max-w-[725px]" data-hero-reveal>
                <h1 className="font-display text-[3rem] font-semibold leading-[0.98] tracking-normal sm:text-[3.4rem] md:text-[4.5rem] md:leading-[90px]">
                  Find property in Nigeria with confidence.
                </h1>
                <p className="mx-auto mt-4 max-w-[340px] text-base leading-6 sm:max-w-none">
                  Search verified homes, shortlets, land, and commercial spaces.
                </p>
              </div>
              <div className="w-full">
                <HeroSearch onDropdownOpenChange={setIsHeroFilterOpen} />
              </div>
            </div>
            <div
              className="pointer-events-none relative z-10 grid w-full max-w-[340px] grid-cols-3 gap-3 text-left transition-[opacity,filter] duration-200 md:absolute md:bottom-10 md:left-1/2 md:flex md:w-auto md:max-w-none md:-translate-x-1/2 md:gap-8"
              data-hero-reveal
              style={{
                filter: isHeroFilterOpen ? "blur(1.5px)" : "blur(0)",
                opacity: isHeroFilterOpen ? 0.25 : 1,
              }}
            >
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="flex flex-col gap-2.5 text-white" key={item.label}>
                    <Icon className="h-6 w-6 md:h-6 md:w-6" />
                    <p className="text-sm font-semibold leading-5 md:w-[146px] md:text-base md:leading-6">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="reality-reveal mx-auto flex max-w-reality flex-col gap-8 px-6 pb-0 pt-10 md:gap-12 md:pt-16 xl:px-0">
            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16" duration={0.76} stagger={0.1} start="top 86%" visibleEntrance y={44}>
              <div>
                <div className="mx-auto max-w-[870px] text-center">
                  <h2 className="font-display text-4xl font-bold leading-tight text-reality-text-primary md:text-6xl" data-motion-child>
                    How it works
                  </h2>
                  <p className="mt-4 text-base leading-7 text-reality-text-secondary md:text-lg" data-motion-child>
                    Find a property and take the next step, from your first search to your next move.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 items-start gap-x-3 gap-y-8 md:mt-12 md:grid-cols-4 md:gap-5">
                {steps.map((step, index) => (
                  <Link
                    aria-label={step.title}
                    className="feature-visual relative flex flex-col items-center rounded-[2rem] px-1 pb-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                    data-feature={step.title.toLowerCase()}
                    data-motion-child
                    href={step.href}
                    key={step.title}
                  >
                    <span
                      className="feature-visual-float relative z-10 block h-36 w-36 sm:h-40 sm:w-40 md:h-52 md:w-52 xl:h-60 xl:w-60"
                      style={{ animationDelay: `${index * -0.65}s` }}
                    >
                      <Image
                        alt=""
                        className="feature-visual-image h-full w-full object-contain"
                        height={256}
                        sizes="(min-width: 1280px) 240px, (min-width: 768px) 208px, 160px"
                        src={step.imageSrc}
                        width={256}
                      />
                    </span>
                    <span className="feature-visual-title relative z-10 mt-2 block text-xl font-semibold text-reality-text-primary md:mt-3 md:text-2xl">
                      {step.title}
                    </span>
                    <span className="relative z-10 mt-2 block max-w-[260px] text-sm leading-6 text-reality-text-secondary md:text-base">
                      {step.description}
                    </span>
                  </Link>
                ))}
              </div>
            </StaggerReveal>

            {featuredQuery.isLoading ? (
              <RailSkeleton title="Featured properties" />
            ) : (
              <PropertyRail
                ctaLabel="View all properties"
                properties={featured}
                surface="muted"
                subtitle="Explore reviewed homes, land, and commercial spaces."
                title="Featured properties"
              />
            )}

            {latestQuery.isLoading ? (
              <RailSkeleton title="Newly added properties" />
            ) : latest.length === 0 ? (
              <section className="rounded-[2rem] bg-reality-surface p-7 md:p-10">
                <h2 className="font-display text-3xl font-medium text-reality-brandEmphasis md:text-4xl">Newly added properties</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-reality-text-secondary">New approved listings will appear here as public inventory grows. Explore the marketplace for everything currently available.</p>
                <Link className={buttonClasses("realitySecondary", "mt-5 w-fit")} href="/properties">Browse properties</Link>
              </section>
            ) : (
              <PropertyRail
                properties={latest}
                surface="plain"
                subtitle="Fresh listings from the public RealityNG marketplace."
                title="Newly added properties"
              />
            )}

            {demoCategories ? (
              <div className="space-y-8" aria-label="Sample property collections">
                <p className="px-2 text-sm font-medium text-reality-text-muted">
                  Sample listings for this local preview — not available to purchase or book.
                </p>
                {demoCategories.shortlets.length >= 2 ? (
                  <PropertyRail properties={demoCategories.shortlets} surface="muted" subtitle="Furnished stay examples in the demo inventory." title="Shortlet stays" />
                ) : null}
                {demoCategories.land.length >= 2 ? (
                  <PropertyRail properties={demoCategories.land} surface="plain" subtitle="Residential and commercial land examples." title="Land opportunities" />
                ) : null}
                {demoCategories.hotels.length >= 2 ? (
                  <PropertyRail properties={demoCategories.hotels} surface="muted" subtitle="Hospitality property examples across Nigeria." title="Hotels & hospitality" />
                ) : null}
              </div>
            ) : null}

            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surfaceDark px-5 py-12 md:px-10 md:py-16" duration={0.76} stagger={0.1} start="top 86%" visibleEntrance y={44}>
              <div>
                <SectionHeading
                  align="center"
                  motion
                  subtitle="Explore popular locations across Nigeria and refine your search from there."
                  title="Browse by city"
                  tone="dark"
                />
              </div>
              {locationsQuery.data?.length ? (
                <AutoScrollRail className="-mx-6 mt-8 flex gap-6 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-3 md:px-0" label="Browse by city">
                  {locationsQuery.data.map((location, index) => (
                    <div data-motion-child key={`${location.state}:${location.name}`}>
                      <CityCard
                        city={location.name}
                        count={location.count}
                        imageSrc={cityImagery[location.name.toLocaleLowerCase()]}
                        index={index}
                        state={location.state}
                      />
                    </div>
                  ))}
                </AutoScrollRail>
              ) : (
                <p className="mt-8 text-center text-sm text-white/80">
                  {locationsQuery.isLoading ? "Loading available locations…" : "Browse all verified properties as locations become available."}
                </p>
              )}
            </StaggerReveal>

            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surfaceBrand px-5 py-12 md:px-10 md:py-16" duration={0.76} stagger={0.1} start="top 86%" visibleEntrance y={44}>
              <div>
                <SectionHeading
                  align="center"
                  motion
                  subtitle="Whether you own properties, help people find them, or provide essential services, RealityNG gives you the tools to get things done with confidence."
                  title="Everything you need to make property easier"
                />
              </div>
              <div className="mt-8 grid gap-5 md:mt-14 md:grid-cols-3">
                {roleCards.map((card) => (
                  <div data-motion-child key={card.title}>
                    <RoleCard card={card} />
                  </div>
                ))}
              </div>
            </StaggerReveal>

            <StaggerReveal
              className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-reality-brand-600 px-8 py-12 md:min-h-[717px] md:rounded-[3.5rem] md:px-[130px]"
              duration={0.8}
              stagger={0.1}
              start="top 86%"
              visibleEntrance
              y={44}
            >
              <Image
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                fill
                sizes="(min-width: 768px) 1328px, 100vw"
                src="/home/cta-businessman.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-reality-brand-600 via-reality-brand-600/70 to-transparent mix-blend-multiply" />
              <div
                className="relative flex min-h-[420px] max-w-[374px] flex-col justify-center text-white md:min-h-[620px]"
              >
                <h2 className="font-display text-[3.5rem] font-medium leading-[1.05] tracking-normal md:text-[4.5rem] md:leading-[79px]" data-motion-child>
                  Found somewhere you like?
                </h2>
                <p className="mt-4 text-lg font-medium leading-7" data-motion-child>
                  Create an account to save properties, book viewings, and keep track of the ones
                  you are interested in.
                </p>
                <Link
                  className={buttonClasses("realitySecondary", "mt-6 h-12 w-fit px-[18px]")}
                  data-motion-child
                  href="/auth/sign-up?next=%2Fonboarding%2Frole-setup"
                >
                  Get Started
                </Link>
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
      <div className="reality-no-scrollbar mt-8 flex snap-x gap-6 overflow-x-auto pb-3 md:mt-12 2xl:grid 2xl:grid-cols-4 2xl:overflow-hidden 2xl:pb-0">
        {[1, 2, 3, 4].map((item) => (
          <div
            className="h-[392px] w-[314px] shrink-0 snap-start animate-pulse rounded-[2rem] bg-reality-bg-muted xl:w-auto"
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

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path d="m5 7 1.5 1.5L9 6M11 7h8M5 12l1.5 1.5L9 11M11 12h8M5 17l1.5 1.5L9 16M11 17h8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
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
