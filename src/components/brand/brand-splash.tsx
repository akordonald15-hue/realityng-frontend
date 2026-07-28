"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_KEY = "realityng.brandSplashSeen";

export function BrandSplash() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (window.sessionStorage.getItem(SPLASH_KEY)) {
      return;
    }

    setIsVisible(true);
    const hideTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_KEY, "true");
      setIsVisible(false);
    }, 1150);

    return () => window.clearTimeout(hideTimer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-label="RealityNG loading"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(17,36,29,0.96),#081c15_62%,#020806_100%)] px-6 text-center transition-opacity duration-500"
      role="status"
    >
      <div className="flex flex-col items-center">
        <Image
          alt="RealityNG"
          className="h-auto w-[min(78vw,520px)] object-contain drop-shadow-[0_16px_44px_rgba(212,160,23,0.22)]"
          height={800}
          priority
          src="/brand/realityng-logo-splash.png"
          width={1200}
        />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-brand-secondary sm:text-sm">
          Where Dreams Find an Address
        </p>
      </div>
    </div>
  );
}
