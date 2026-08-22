import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ProtectedActionLink } from "@/components/auth/protected-action-link";

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

export function Footer() {
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
