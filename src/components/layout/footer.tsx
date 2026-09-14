import Link from "next/link";
import Image from "next/image";

import { BrandLogo } from "@/components/brand/brand-logo";
import { PageContainer } from "@/components/layout/page-container";

const exploreLinks = [
  { href: "/properties?listing_type=sale", label: "Buy property" },
  { href: "/properties?listing_type=rent", label: "Rent property" },
  { href: "/properties?property_type=shortlet", label: "Shortlets" },
  { href: "/properties?property_type=land", label: "Land" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/data-deletion", label: "Data deletion" },
  { href: "/refunds", label: "Refunds" },
  { href: "/refunds", label: "Cancellation" },
];

type FooterProps = {
  variant?: "reality";
};

export function Footer({ variant = "reality" }: FooterProps = {}) {
  void variant;

  return (
    <footer className="border-t border-reality-border-secondary bg-white font-body text-reality-text-secondary">
      <PageContainer className="py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.5fr_0.72fr_0.72fr_0.72fr]">
          <div>
            <BrandLogo className="h-9 w-auto object-contain" showTagline={false} />
          </div>
          <FooterColumn links={exploreLinks} title="Explore" />
          <FooterColumn links={companyLinks} title="Company" />
          <FooterColumn links={legalLinks} title="Legal" />
        </div>

        <div className="relative mt-12 h-[240px] w-full overflow-hidden rounded-[22px] bg-white md:mt-16 md:h-auto md:aspect-[2.48] md:min-h-[240px]">
          <Image
            alt="Modern city skyline with green residential spaces"
            className="object-cover object-bottom"
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            src="/professionals/footer-cityscape.webp"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-white via-white/82 to-white/0" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[32%] bg-white/30 backdrop-blur-[1px]" />
        </div>
      </PageContainer>
      <div className="border-t border-reality-border-secondary">
        <PageContainer className="flex flex-col gap-2 py-5 text-xs text-reality-text-quaternary md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RealityNG. All rights reserved.</p>
          <p>Where Dreams Find an Address.</p>
        </PageContainer>
      </div>
    </footer>
  );
}

function FooterColumn({
  links,
  title,
}: {
  links: Array<{ href: string; label: string }>;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-reality-text-primary">{title}</p>
      <div className="mt-4 grid gap-3 text-sm text-reality-text-tertiary">
        {links.map((link) => (
          <Link className="transition hover:text-reality-brand-500" href={link.href} key={`${link.href}-${link.label}`}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

