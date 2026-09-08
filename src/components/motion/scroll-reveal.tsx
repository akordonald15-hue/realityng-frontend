"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { gsap, registerGsapPlugins, useGSAP } from "@/lib/motion/gsap";
import { fadeUp } from "@/lib/motion/presets";

type ScrollRevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  disabled?: boolean;
  start?: string;
};

export function ScrollReveal({
  children,
  disabled = false,
  start = "top 82%",
  ...props
}: ScrollRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();

      if (process.env.NODE_ENV === "test") {
        return;
      }

      const element = scope.current;
      if (!element || disabled) {
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        gsap.set(element, { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      gsap.fromTo(
        element,
        { ...fadeUp.from, y: isMobile ? 24 : fadeUp.from.y },
        {
          ...fadeUp.to,
          duration: isMobile ? 0.72 : fadeUp.to.duration,
          scrollTrigger: {
            once: true,
            start,
            trigger: element,
          },
        },
      );
    },
    { dependencies: [disabled, start], scope },
  );

  return (
    <div ref={scope} {...props}>
      {children}
    </div>
  );
}
