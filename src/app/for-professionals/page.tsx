import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";
import { PublicShell } from "@/components/layout/public-shell";
import { StaggerReveal } from "@/components/motion/stagger-reveal";
import { ProfessionalCta } from "@/components/professionals/professional-cta";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "RealityNG for Property Owners and Agents",
  description:
    "List properties, manage enquiries, review applications, and coordinate viewings with RealityNG's professional property workspace.",
  alternates: {
    canonical: "/for-professionals",
  },
};

const trustItems = ["Verified professionals", "Reviewed listings", "Secure private"];

const steps = [
  {
    title: "Create your profile",
    description: "Start with an owner or agent account that keeps your professional activity together.",
  },
  {
    title: "Get verified",
    description: "Use the existing verification flow so seekers can understand who they are working with.",
  },
  {
    title: "List or manage",
    description: "Create listings, edit assigned properties, and keep your portfolio accurate.",
  },
  {
    title: "Connect",
    description: "Manage leads, messages, applications, and viewings from one supply workspace.",
  },
];

const ownerFeatures = [
  "List properties for sale or rent",
  "Review real viewing requests",
  "Manage property inspection",
];

const agentFeatures = [
  "Showcase your services",
  "Build a trusted profile",
  "Receive job enquiries",
];

const ownerProfiles = [
  { badge: "Agent", name: "Verified Agent", meta: "Property professional" },
  { badge: "Owner", name: "Property Owner", meta: "Verified landlord" },
  { badge: "Agent", name: "Sales Agent", meta: "Property consultant" },
  { badge: "Agent", name: "Listing Manager", meta: "Portfolio support" },
];

const artisanProfiles = [
  { badge: "Painter", name: "Home Painter", meta: "4 projects" },
  { badge: "Cleaner", name: "Deep Cleaner", meta: "4 projects" },
  { badge: "Repairs", name: "Maintenance Pro", meta: "4 projects" },
];

const trustFeatures = [
  {
    title: "Verified profiles",
    description: "Professional roles and property submissions keep the marketplace accountable.",
  },
  {
    title: "Everything in one place",
    description: "Properties, enquiries, applications, viewings, and messages stay in one dashboard.",
  },
  {
    title: "Reach the right people",
    description: "Put listings in front of buyers and renters already searching RealityNG.",
  },
];

export default function ForProfessionalsPage() {
  return (
    <div className="bg-reality-canvas text-reality-text-primary">
      <PublicShell transparentHeader variant="reality">
        <main>
          <section className="relative min-h-[720px] overflow-hidden bg-reality-brand-900 text-white lg:min-h-[790px]">
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[68%_center] md:scale-[1.08] md:translate-x-[7%] lg:scale-[1.12] lg:translate-x-[10%] lg:object-[74%_center]"
              fill
              priority
              sizes="100vw"
              src="/home/cta-businessman.webp"
            />
            <div className="absolute inset-0 bg-reality-brand-900/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-reality-brand-900 via-reality-brand-900/78 to-reality-brand-900/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-reality-brand-900/28 via-transparent to-reality-brand-900/42" />
            <div className="relative mx-auto flex min-h-[720px] w-full max-w-reality items-center px-5 pb-16 pt-28 sm:px-6 lg:min-h-[790px] lg:px-6 2xl:px-0">
              <div className="max-w-[560px]">
                <h1 className="font-display text-[3rem] font-medium leading-[1.08] tracking-normal md:text-[4.25rem] lg:text-[4.7rem]">
                  Get your property or service in front of the right people
                </h1>
                <p className="mt-6 max-w-[420px] text-sm font-medium leading-6 text-white/82 md:text-base md:leading-7">
                  List a property, showcase your services, and connect with people ready to rent,
                  buy, or hire.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ProfessionalCta className="h-11 px-5" role="landlord">
                    Get started
                  </ProfessionalCta>
                  <Link className={buttonClasses("realitySecondary", "h-11 px-5")} href="#professional-paths">
                    Explore
                  </Link>
                </div>
                <div className="mt-14 grid max-w-[340px] grid-cols-3 gap-5 text-xs font-semibold leading-5 text-white/88">
                  {trustItems.map((item) => (
                    <div className="grid gap-3" key={item}>
                      <CheckIcon className="h-5 w-5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto grid w-full max-w-reality gap-16 px-5 py-16 sm:px-6 lg:px-6 lg:py-24 2xl:px-0">
            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16" stagger={0.08} y={30}>
              <div className="mx-auto max-w-[520px] text-center" data-motion-child>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-text-brand">
                  How it works
                </p>
                <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                  Find a property seeker and take the next step
                </h2>
                <p className="mx-auto mt-3 max-w-[420px] text-xs leading-5 text-reality-text-tertiary md:text-sm">
                  Move from public discovery into the authenticated workspace only when you are
                  ready to act.
                </p>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {steps.map((step, index) => (
                  <article
                    className="rounded-[18px] border border-reality-border-secondary bg-reality-surfaceMuted p-5 shadow-reality-xs transition hover:-translate-y-1 hover:shadow-reality-sm"
                    data-motion-child
                    key={step.title}
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-reality-brand-600 text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <ArrowUpRightIcon className="h-4 w-4 text-reality-text-tertiary" />
                    </div>
                    <h3 className="mt-5 text-sm font-semibold">{step.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-reality-text-tertiary">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </StaggerReveal>

            <SplitSection
              eyebrow="property owners/agents"
              features={ownerFeatures}
              imageSide="right"
              imageSrc="/professionals/property-professional.webp"
              label="List a property"
              title="Put your property in front of serious seekers"
            >
              List your property, manage inspections, and keep track of enquiries without the usual
              back and forth.
            </SplitSection>

            <SplitSection
              eyebrow="artisans"
              features={agentFeatures}
              imageSide="left"
              imageSrc="/professionals/artisan-professional.webp"
              label="Find an artisan"
              title="Get discovered by people who need your skills"
            >
              Showcase your work, connect with property owners, agents, and customers looking for
              reliable professionals.
            </SplitSection>

            <StaggerReveal as="section" className="rounded-[2rem] bg-reality-surface px-5 py-12 md:px-10 md:py-16" stagger={0.1} y={30}>
              <div className="mx-auto max-w-[560px] text-center" data-motion-child>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
                  Trust
                </p>
                <h2 className="mt-4 font-display text-4xl font-medium leading-tight md:text-6xl">
                  More than visibility. Build trust too.
                </h2>
                <p className="mt-4 text-sm leading-6 text-reality-text-tertiary md:text-base">
                  RealityNG keeps the professional experience grounded in verified profiles,
                  reviewed listings, and clear customer communication.
                </p>
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {trustFeatures.map((feature) => (
                  <article
                    className="rounded-[18px] border border-reality-border-secondary bg-reality-surfaceMuted p-6"
                    data-motion-child
                    key={feature.title}
                  >
                    <CheckIcon className="h-7 w-7 text-reality-brand-600" />
                    <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-reality-text-tertiary">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </StaggerReveal>

            <ProfileRail
              eyebrow="Explore Property"
              imageSrc="/professionals/property-professional.webp"
              items={ownerProfiles}
              variant="compact"
              title="Explore Property Owners/Agents"
            />

            <ProfileRail
              ctaHref="/services"
              ctaLabel="Discover Artisans"
              eyebrow="Explore Property"
              imageSrc="/professionals/artisan-professional.webp"
              items={artisanProfiles}
              variant="feature"
              title="Explore Artisans"
            />

            <section className="grid gap-6 lg:grid-cols-2" id="professional-paths">
              <RolePathCard
                description="Own or manage properties directly. Create listings, review demand, and keep your property activity organized."
                label="List a Property"
                role="landlord"
                title="Property Owners"
              />
              <RolePathCard
                description="Represent property owners with delegated access, then manage the work assigned to you from one dashboard."
                label="Join as an Agent"
                role="agent"
                title="Agents"
              />
            </section>

            <StaggerReveal
              as="section"
              className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-reality-brandEmphasis px-8 py-12 text-white md:min-h-[430px] md:rounded-[2.25rem] md:px-16"
              stagger={0.1}
              y={30}
            >
              <Image
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
                fill
                sizes="(min-width: 1280px) 1216px, 100vw"
                src="/home/cta-businessman.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-reality-surfaceDark/95 via-reality-surfaceDark/85 to-reality-surfaceDark/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-reality-surfaceDark/25 via-transparent to-reality-surfaceDark/35" />
              <div className="relative flex min-h-[300px] max-w-[390px] flex-col justify-center" data-motion-child>
                <h2 className="font-display text-4xl font-medium leading-tight md:text-5xl">
                  Ready to get started as a Professional?
                </h2>
                <p className="mt-4 text-sm font-medium leading-6 text-white/85">
                  Create the right account, complete verification where required, and move into the
                  supply dashboard when your role is ready.
                </p>
                <ProfessionalCta className="mt-6 h-10 w-fit px-5" role="landlord" variant="realitySecondary">
                  Get Started
                </ProfessionalCta>
              </div>
            </StaggerReveal>

          </div>
        </main>
      </PublicShell>
      <PublicAssistantWidget />
    </div>
  );
}

function SplitSection({
  children,
  eyebrow,
  features,
  imageSide,
  imageSrc,
  label,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  features: string[];
  imageSide: "left" | "right";
  imageSrc: string;
  label: string;
  title: string;
}) {
  const image = (
    <div className="relative min-h-[280px] overflow-hidden rounded-[22px] bg-reality-bg-muted md:min-h-[320px]">
      <Image alt="" className="object-cover" fill sizes="(min-width: 1024px) 652px, 100vw" src={imageSrc} />
    </div>
  );

  const copy = (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-text-brand">
        For {eyebrow}
      </p>
      <h2 className="mt-3 max-w-[470px] font-display text-3xl font-medium leading-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-[430px] text-sm leading-6 text-reality-text-tertiary">
        {children}
      </p>
      <ul className="mt-5 grid gap-3">
        {features.map((feature) => (
          <li className="flex items-start gap-3 text-xs font-semibold text-reality-text-secondary" key={feature}>
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#b08a29]/15 text-[#b08a29]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {imageSide === "left" ? (
        <Link className={buttonClasses("reality", "mt-5 h-9 w-fit px-4 text-xs")} href="/services">
          {label}
        </Link>
      ) : (
        <ProfessionalCta className="mt-5 h-9 w-fit px-4 text-xs" role="landlord">
          {label}
        </ProfessionalCta>
      )}
    </div>
  );

  return (
    <StaggerReveal as="section" className="grid gap-10 lg:grid-cols-2 lg:items-center" stagger={0.1} y={30}>
      <div data-motion-child>{imageSide === "left" ? image : copy}</div>
      <div data-motion-child>{imageSide === "left" ? copy : image}</div>
    </StaggerReveal>
  );
}

function ProfileRail({
  ctaHref,
  ctaLabel,
  eyebrow,
  imageSrc,
  items,
  title,
  variant = "compact",
}: {
  ctaHref?: string;
  ctaLabel?: string;
  eyebrow: string;
  imageSrc: string;
  items: Array<{ badge: string; name: string; meta: string }>;
  title: string;
  variant?: "compact" | "feature";
}) {
  const isFeature = variant === "feature";

  return (
    <StaggerReveal
      as="section"
      className={isFeature ? "mx-auto w-full max-w-[1180px] py-6 text-center" : "mx-auto w-full max-w-[980px] text-center"}
      stagger={0.08}
      y={24}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-text-brand" data-motion-child>
        {eyebrow}
      </p>
      <h2
        className={
          isFeature
            ? "mt-2 font-display text-4xl font-medium leading-tight md:text-6xl"
            : "mt-2 font-display text-3xl font-medium leading-tight md:text-4xl"
        }
        data-motion-child
      >
        {title}
      </h2>
      <div
        className={
          isFeature
            ? "mx-auto mt-10 grid w-full max-w-[1080px] gap-7 md:grid-cols-3"
            : "mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        }
        data-motion-child
      >
        {items.map((item, index) => (
          <article className="text-left" key={`${item.badge}-${item.name}-${index}`}>
            <Link
              aria-label={`${item.name} ${item.badge}`}
              className={
                isFeature
                  ? "group block overflow-hidden rounded-[22px] bg-reality-bg-subtle shadow-reality-sm"
                  : "group block overflow-hidden rounded-[18px] bg-reality-bg-subtle shadow-reality-xs"
              }
              href={ctaHref ?? "/for-professionals"}
            >
              <div className={isFeature ? "relative aspect-[1.06] overflow-hidden" : "relative aspect-[1.14] overflow-hidden"}>
                <Image
                  alt=""
                  className="object-cover transition duration-300 group-hover:scale-[1.04]"
                  fill
                  sizes={
                    isFeature
                      ? "(min-width: 1024px) 340px, (min-width: 768px) 30vw, 100vw"
                      : "(min-width: 1024px) 220px, (min-width: 640px) 45vw, 100vw"
                  }
                  src={imageSrc}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-black/10" />
                <span className="absolute right-3 top-3 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold text-reality-text-secondary md:text-xs">
                  {item.badge}
                </span>
              </div>
              <div className={isFeature ? "flex items-center justify-between px-5 py-5" : "flex items-center justify-between px-3 py-3"}>
                <div>
                  <h3 className={isFeature ? "text-base font-semibold text-reality-text-primary" : "text-xs font-semibold text-reality-text-primary"}>{item.name}</h3>
                  <p className={isFeature ? "mt-1 text-sm text-reality-text-tertiary" : "mt-1 text-[11px] text-reality-text-tertiary"}>{item.meta}</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-reality-brand-500" />
              </div>
            </Link>
          </article>
        ))}
      </div>
      {ctaHref && ctaLabel ? (
        <Link className={buttonClasses("reality", "mx-auto mt-7 h-9 px-4 text-xs")} data-motion-child href={ctaHref}>
          {ctaLabel}
        </Link>
      ) : null}
    </StaggerReveal>
  );
}

function RolePathCard({
  description,
  label,
  role,
  title,
}: {
  description: string;
  label: string;
  role: "agent" | "landlord";
  title: string;
}) {
  return (
    <article className="rounded-[2rem] border border-reality-border-secondary bg-white p-8 shadow-reality-xs">
      <h3 className="font-display text-4xl font-medium">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-reality-text-tertiary">{description}</p>
      <ProfessionalCta className="mt-7 h-12 px-6" role={role}>
        {label}
      </ProfessionalCta>
    </article>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
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


