"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";

function XIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

type AuthCardProps = {
  children: ReactNode;
  description?: ReactNode;
  showLogomark?: boolean;
  title?: string;
};

export function AuthCard({ children, description, showLogomark = false, title }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-reality-bg-muted px-5 py-8 font-body text-reality-text-primary sm:px-6">
      <section className="relative w-full max-w-reality-form rounded-[32px] bg-white px-6 py-8 shadow-reality-sm sm:px-12 sm:py-12">
        <Link
          aria-label="Close authentication"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-reality-bg-muted text-reality-text-quaternary transition hover:bg-reality-border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
          href="/"
          title="Close authentication"
        >
          <span className="h-5 w-5">
            <XIcon />
          </span>
        </Link>
        {showLogomark ? (
          <Link
            aria-label="RealityNG home"
            className="mb-6 flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] border border-reality-alpha-black20 bg-white shadow-reality-sm"
            href="/"
          >
            <BrandLogo className="h-7 w-7 object-cover object-left" priority variant="icon" />
          </Link>
        ) : null}
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
    </main>
  );
}
