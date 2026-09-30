"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

type AuthCardProps = {
  children: ReactNode;
  description?: ReactNode;
  showLogomark?: boolean;
  title?: string;
};

export function AuthCard({ children, description, showLogomark = false, title }: AuthCardProps) {
  return (
    <main className="grid min-h-screen bg-reality-canvas font-body text-reality-text-primary lg:grid-cols-[minmax(320px,0.82fr)_minmax(560px,1.18fr)]">
      <aside className="relative hidden overflow-hidden bg-reality-surfaceDark px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-reality-brand-500/20 blur-3xl" />
        <Link aria-label="RealityNG home" className="relative inline-flex w-fit" href="/">
          <BrandLogo className="h-11 w-auto object-contain" priority tone="light" />
        </Link>
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">Your property journey</p>
          <h2 className="mt-5 font-display text-5xl font-medium leading-[1.05]">Move with clarity and confidence.</h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/75">Save homes, manage applications, arrange viewings, and keep every next step in one secure place.</p>
        </div>
        <p className="relative text-sm text-white/60">Verified workflows. Private documents. Clear decisions.</p>
      </aside>

      <div className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-14">
      <section className="relative w-full max-w-[480px] rounded-[32px] border border-reality-border-secondary bg-white px-6 py-8 shadow-reality-sm sm:px-12 sm:py-12">
        <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
          <Link
            aria-label="RealityNG home"
            className="inline-flex"
            href="/"
          >
            <BrandLogo className="h-9 w-auto object-contain" priority />
          </Link>
          {showLogomark ? <span className="rounded-full bg-reality-surfaceBrand px-3 py-1 text-xs font-semibold text-reality-brandEmphasis">Create account</span> : null}
        </div>
        {title || description ? (
          <div className="max-w-[354px]">
            {title ? (
              <h1 className="text-[30px] font-medium leading-[38px] text-black">{title}</h1>
            ) : null}
            {description ? (
              <div className="mt-3 text-sm leading-5 text-reality-text-quaternary">
                {description}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={title || description ? "mt-6" : undefined}>{children}</div>
      </section>
      </div>
    </main>
  );
}
