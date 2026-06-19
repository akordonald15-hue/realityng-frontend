import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 text-sm text-brand-muted sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-2xl font-semibold text-brand-text">RealityNG</p>
          <p className="mt-3 max-w-md leading-6">
            Trusted Nigerian property discovery for buyers, renters, landlords, and diaspora
            investors.
          </p>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Explore</p>
          <div className="mt-3 grid gap-2">
            <Link className="hover:text-brand-text" href="/properties">
              Browse properties
            </Link>
            <Link className="hover:text-brand-text" href="/saved-properties">
              Saved properties
            </Link>
            <Link className="hover:text-brand-text" href="/properties/new">
              Add a listing
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-text">Standards</p>
          <p className="mt-3 leading-6">
            Approved listings, owner controls, review workflows, and gallery-first presentation.
          </p>
        </div>
      </div>
    </footer>
  );
}
