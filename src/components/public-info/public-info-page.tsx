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
      <Navbar variant="reality" />
      <main className="bg-white text-reality-text-primary [color-scheme:light]">
        <section className="border-b border-reality-border-secondary">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-reality-brand-600">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold text-reality-text-primary md:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-reality-text-secondary">{description}</p>
              {badge ? (
                <div className="mt-6">
                  <Badge variant="green">{badge}</Badge>
                </div>
              ) : null}
            </div>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
                RealityNG standard
              </p>
              <div className="mt-4 grid gap-3">
                {highlights.map((highlight) => (
                  <div className="rounded-[16px] border border-reality-border-secondary bg-reality-bg-subtle p-3" key={highlight}>
                    <p className="text-sm leading-6 text-reality-text-secondary">{highlight}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-6 lg:grid-cols-2">
          {sections.map((section) => (
            <Card className="p-5" key={section.title}>
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-reality-text-secondary">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 grid gap-2 text-sm leading-6 text-reality-text-secondary">
                  {section.bullets.map((bullet) => (
                    <li className="flex gap-2" key={bullet}>
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-reality-brand-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </section>
        {cta ? (
          <section className="border-t border-reality-border-secondary">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                  {cta.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-reality-text-secondary">{cta.body}</p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full bg-reality-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                href={cta.href}
              >
                Continue
              </Link>
            </div>
          </section>
        ) : null}
      </main>
      <Footer variant="reality" />
    </>
  );
}

