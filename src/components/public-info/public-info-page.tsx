import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type PublicInfoSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type PublicInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  highlights: string[];
  sections: PublicInfoSection[];
  cta?: {
    label: string;
    href: string;
    body: string;
  };
};

export function PublicInfoPage({
  eyebrow,
  title,
  description,
  badge,
  highlights,
  sections,
  cta,
}: PublicInfoPageProps) {
  return (
    <>
      <Navbar />
      <main className="bg-brand-background">
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold text-brand-text md:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-muted">{description}</p>
              {badge ? (
                <div className="mt-6">
                  <Badge variant="green">{badge}</Badge>
                </div>
              ) : null}
            </div>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                RealityNG standard
              </p>
              <div className="mt-4 grid gap-3">
                {highlights.map((highlight) => (
                  <div className="rounded-md border border-white/10 bg-white/5 p-3" key={highlight}>
                    <p className="text-sm leading-6 text-brand-muted">{highlight}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-6 lg:grid-cols-2">
          {sections.map((section) => (
            <Card className="p-5" key={section.title}>
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 grid gap-2 text-sm leading-6 text-brand-muted">
                  {section.bullets.map((bullet) => (
                    <li className="flex gap-2" key={bullet}>
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </section>
        {cta ? (
          <section className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
                  {cta.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">{cta.body}</p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand-secondary px-5 text-sm font-semibold text-brand-background transition hover:bg-brand-lightGold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
                href={cta.href}
              >
                Continue
              </Link>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
