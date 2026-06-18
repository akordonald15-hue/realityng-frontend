import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link className="font-heading text-2xl font-semibold text-brand-text" href="/">
          RealityNG
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-brand-muted md:flex">
          <Link className="transition hover:text-brand-text" href="/properties">
            Browse
          </Link>
          <Link className="transition hover:text-brand-text" href="/properties/new">
            List property
          </Link>
          <Link className="transition hover:text-brand-text" href="/auth/sign-in">
            Sign in
          </Link>
        </div>
        <Link href="/properties/new">
          <Button className="h-10">Add listing</Button>
        </Link>
      </nav>
    </header>
  );
}
