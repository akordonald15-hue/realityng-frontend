"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

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
    imageSrc: "/home/city-abuja.webp",
  },
  {
    city: "Port Harcourt",
    areas: "Old GRA, Trans Amadi, Peter Odili Road",
    imageSrc: "/home/city-port-harcourt.webp",
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
        <p className="mb-4 text-lg font-medium leading-7 text-reality-text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-[2rem] font-medium leading-none tracking-normal text-black md:text-[3.75rem] md:leading-[1.2]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-7 text-reality-text-tertiary md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function HeroSearch({ onDropdownOpenChange }: { onDropdownOpenChange?: (isOpen: boolean) => void }) {
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
      <div className="relative grid w-full overflow-visible rounded-[1.75rem] bg-[#062820]/95 p-1 shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-white/10 backdrop-blur md:h-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_56px] md:rounded-full">
        <SearchField icon={MapPinIcon} label="Location">
          <input
            aria-label="Search location"
            className="h-5 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-medium text-white/75 outline-none placeholder:text-white/60 focus-visible:text-white"
            onChange={(event) => setCity(event.target.value)}
            placeholder="Where"
            value={city}
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
  subtitle,
  title,
}: {
  ctaLabel?: string;
  properties: Property[];
  subtitle: string;
  title: string;
}) {
  return (
    <StaggerReveal as="section" className="block" stagger={0.11} y={36}>
      <div className="mb-8 flex items-start justify-between gap-5 md:mb-14" data-motion-child>
        <div>
          <h2 className="font-display text-[2rem] font-medium leading-none text-black md:text-[3.75rem] md:leading-none">
            <Link className="group inline-flex items-center gap-3" href="/properties">
              {title}
              <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-reality-bg-muted text-black transition group-hover:bg-reality-brand-50 md:inline-flex">
                <ArrowRightIcon className="h-5 w-5" />
              </span>
            </Link>
          </h2>
          <p className="mt-3 text-base leading-7 text-reality-text-muted">{subtitle}</p>
        </div>
      </div>
      {properties.length > 0 ? (
        <div className={properties.length < 3 ? "flex snap-x justify-start gap-6 overflow-x-auto pb-3 md:justify-center" : "flex snap-x gap-6 overflow-x-auto pb-3 2xl:grid 2xl:grid-cols-4 2xl:overflow-visible 2xl:pb-0"}>
          {properties.map((property) => (
            <div className="w-[min(314px,82vw)] shrink-0 snap-start" data-motion-child key={property.id}>
              <PropertyCard property={property} variant="reality" />
            </div>
          ))}
          {properties.length < 3 ? (
            <div className="flex min-h-[340px] w-[min(314px,82vw)] shrink-0 snap-start flex-col justify-center rounded-[2rem] border border-reality-border-secondary bg-reality-surfaceBrand p-7 md:max-w-[520px] md:flex-1" data-motion-child>
              <p className="font-display text-2xl font-medium leading-tight text-reality-brandEmphasis">Looking for more options?</p>
              <p className="mt-3 text-sm leading-6 text-reality-text-secondary">Browse the full marketplace and refine your search by location, type, or price.</p>
              <Link className={buttonClasses("reality", "mt-6 w-fit")} href="/properties">Browse properties</Link>
            </div>
          ) : null}
        </div>
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />
      <span className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur">
        <ArrowUpRightIcon className="h-6 w-6" />
      </span>
      <div className="absolute inset-x-6 bottom-6 text-center text-white">
        <h3 className="text-xl font-semibold leading-7">{city}</h3>
        <p className="mt-0.5 text-base leading-6 text-white">{areas}</p>
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
            className="relative isolate flex min-h-[960px] items-start justify-center overflow-hidden bg-reality-brand-900 px-5 pb-16 pt-[118px] md:min-h-[820px] md:px-6 md:pt-[190px] xl:min-h-[900px] xl:px-0 xl:pt-[220px]"
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
            <div className="relative z-10 flex w-full max-w-[1066px] flex-col items-center gap-7 text-center text-white md:gap-[35px]">
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
              className="pointer-events-none absolute bottom-9 left-1/2 grid w-[min(334px,calc(100%-2.5rem))] -translate-x-1/2 grid-cols-3 gap-3 text-left transition-[opacity,filter] duration-200 md:bottom-16 md:flex md:w-auto md:gap-8"
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
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    <p className="text-xs font-medium leading-[18px] md:w-[146px] md:text-base md:leading-6">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="reality-reveal mx-auto flex max-w-reality flex-col gap-8 px-6 py-12 md:gap-12 md:py-16 xl:px-0">
            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16" stagger={0.1} y={34}>
              <div data-motion-child>
                <SectionHeading
                  align="center"
                  eyebrow="How it works"
                  subtitle="Browse, save, book a viewing, and keep track of everything in one place."
                  title="Find a property and take the next step"
                />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 md:mt-12 md:grid-cols-4 md:gap-6">
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
                        <Icon className="h-6 w-6 text-black" />
                        <ArrowUpRightIcon className="hidden h-5 w-5 text-black transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
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
              </div>
            </StaggerReveal>

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
            ) : latest.length === 0 ? (
              <section className="rounded-[2rem] bg-reality-surfaceBrand p-7 md:p-10">
                <h2 className="font-display text-3xl font-medium text-reality-brandEmphasis md:text-4xl">Newly added properties</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-reality-text-secondary">New approved listings will appear here as public inventory grows. Explore the marketplace for everything currently available.</p>
                <Link className={buttonClasses("realitySecondary", "mt-5 w-fit")} href="/properties">Browse properties</Link>
              </section>
            ) : (
              <PropertyRail
                properties={latest}
                subtitle="Fresh listings from the public RealityNG marketplace."
                title="Newly added properties"
              />
            )}

            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16" stagger={0.11} y={36}>
              <div data-motion-child>
                <SectionHeading
                  align="center"
                  subtitle="Explore popular locations across Nigeria and refine your search from there."
                  title="Browse by city"
                />
              </div>
              <div className="-mx-6 mt-8 flex snap-x gap-6 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-3 md:px-0">
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
              </div>
            </StaggerReveal>

            <StaggerReveal as="section" className="py-10 md:py-14" stagger={0.11} y={36}>
              <div data-motion-child>
                <SectionHeading
                  align="center"
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
              stagger={0.11}
              y={34}
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
                data-motion-child
              >
                <h2 className="font-display text-[3.5rem] font-medium leading-[1.05] tracking-normal md:text-[4.5rem] md:leading-[79px]">
                  Found somewhere you like?
                </h2>
                <p className="mt-4 text-lg font-medium leading-7">
                  Create an account to save properties, book viewings, and keep track of the ones
                  you are interested in.
                </p>
                <Link
                  className={buttonClasses("realitySecondary", "mt-6 h-12 w-fit px-[18px]")}
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
      <div className="mt-8 flex snap-x gap-6 overflow-x-auto pb-3 md:mt-12 2xl:grid 2xl:grid-cols-4 2xl:overflow-hidden 2xl:pb-0">
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

