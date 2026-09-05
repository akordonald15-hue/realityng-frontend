import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { PageContainer } from "@/components/layout/page-container";

const exploreLinks = [
  { href: "/properties?listing_type=sale", label: "Buy property" },
  { href: "/properties?listing_type=rent", label: "Rent property" },
  { href: "/properties?property_type=shortlet", label: "Shortlets" },
  { href: "/properties?property_type=land", label: "Land" },
  { href: "/properties?property_type=commercial", label: "Commercial" },
];

const trustLinks = [
  { href: "/verification-standards", label: "Verification standards" },
  { href: "/listing-standards", label: "Listing standards" },
  { href: "/safety", label: "Safety guidance" },
  { href: "/verification", label: "Verification centre" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/fraud-reporting", label: "Report fraud or abuse" },
];

const companyLinks = [
  { href: "/about", label: "About RealityNG" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/data-deletion", label: "Data deletion" },
  { href: "/refunds", label: "Refunds and cancellations" },
  { href: "/escrow-disclosure", label: "Escrow disclosure" },
  { href: "/financing-disclosure", label: "Financing disclosure" },
];

type FooterProps = {
  variant?: "legacy" | "reality";
};

export function Footer({ variant = "legacy" }: FooterProps = {}) {
  if (variant === "reality") {
    return (
      <footer className="border-t border-reality-border-secondary bg-white font-body text-reality-text-secondary">
        <PageContainer className="grid gap-8 py-10 text-sm lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <BrandLogo className="h-9 w-auto object-contain" showTagline={false} />
            <p className="mt-4 max-w-sm leading-6">
              Trusted Nigerian property discovery for buyers, renters, landlords, and diaspora
              investors.
            </p>
          </div>
          <div>
            <p className="font-semibold text-reality-text-primary">Explore</p>
            <div className="mt-3 grid gap-2">
              {exploreLinks.map((link) => (
                <Link className="hover:text-reality-brand-500" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-reality-text-primary">Account</p>
            <div className="mt-3 grid gap-2">
              <Link className="hover:text-reality-brand-500" href="/saved-properties">
                Saved properties
              </Link>
              <ProtectedActionLink
                actionLabel="List property"
                className="hover:text-reality-brand-500"
                href="/properties/new"
              >
                List a Property
              </ProtectedActionLink>
              <Link className="hover:text-reality-brand-500" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:text-reality-brand-500" href="/settings/profile">
                Profile
              </Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-reality-text-primary">Company</p>
            <div className="mt-3 grid gap-2">
              {[...trustLinks, ...companyLinks].map((link) => (
                <Link className="hover:text-reality-brand-500" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
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

  return (
    <footer className="border-t border-white/10 bg-brand-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm text-brand-muted sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo
            className="h-16 w-auto object-contain"
            showTagline
            taglineClassName="mt-0.5 text-[0.58rem]"
          />
          <p className="mt-3 max-w-md leading-6">
            Trusted Nigerian property discovery for buyers, renters, landlords, and diaspora
            investors.
          </p>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Explore</p>
          <div className="mt-3 grid gap-2">
            {exploreLinks.map((link) => (
              <Link className="hover:text-brand-text" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Account</p>
          <div className="mt-3 grid gap-2">
            <Link className="hover:text-brand-text" href="/saved-properties">
              Saved properties
            </Link>
            <ProtectedActionLink
              actionLabel="List property"
              className="hover:text-brand-text"
              href="/properties/new"
            >
              List a Property
            </ProtectedActionLink>
            <Link className="hover:text-brand-text" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-brand-text" href="/settings/profile">
              Profile
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Trust and support</p>
          <div className="mt-3 grid gap-2">
            {trustLinks.map((link) => (
              <Link className="hover:text-brand-text" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Company and legal</p>
          <div className="mt-3 grid gap-2">
            {companyLinks.map((link) => (
              <Link className="hover:text-brand-text" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-brand-muted sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RealityNG. All rights reserved.</p>
          <p>Where Dreams Find an Address.</p>
        </div>
      </div>
    </footer>
  );
}
