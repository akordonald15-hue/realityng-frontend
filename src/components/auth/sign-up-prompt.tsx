"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonClasses } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const DISMISSED_AT_KEY = "realityng.signUpPromptDismissedAt";
const DISMISSAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const PROMPT_DELAY_MS = 12_000;

function wasRecentlyDismissed() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY));
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISSAL_WINDOW_MS;
}

export function SignUpPrompt() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isDiscoveryRoute = pathname === "/" || pathname.startsWith("/properties");

  useEffect(() => {
    if (isLoading || isAuthenticated || !isDiscoveryRoute || wasRecentlyDismissed()) {
      return;
    }
    const timer = window.setTimeout(() => setIsOpen(true), PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isDiscoveryRoute, isLoading, pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    closeButtonRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  const nextPath = pathname.startsWith("/properties/") ? pathname : "/properties";

  return (
    <div
      aria-labelledby="sign-up-prompt-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-md border border-brand-secondary/30 bg-white p-6 text-[#081C15] shadow-2xl sm:p-8">
        <button
          aria-label="Close account prompt"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-xl hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          onClick={dismiss}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>
        <BrandLogo className="h-14 w-auto object-contain" priority />
        <h2 className="mt-6 font-heading text-3xl font-semibold" id="sign-up-prompt-title">
          Keep the right property close.
        </h2>
        <p className="mt-3 leading-7 text-[#375047]">
          Create a free account to save listings, build a comparison shortlist, and continue from
          any device.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className={buttonClasses("primary", "w-full")}
            href={`/auth/sign-up?next=${encodeURIComponent(nextPath)}`}
            onClick={() => setIsOpen(false)}
          >
            Create account
          </Link>
          <Link
            className={buttonClasses(
              "secondary",
              "w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10 focus-visible:ring-brand-primary",
            )}
            href={`/auth/sign-in?next=${encodeURIComponent(nextPath)}`}
            onClick={() => setIsOpen(false)}
          >
            Sign in
          </Link>
        </div>
        <button
          className="mt-5 w-full text-sm font-semibold text-[#52675f] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          onClick={dismiss}
          type="button"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
