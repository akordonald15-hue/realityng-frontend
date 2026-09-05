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
  start = "top 84%",
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

      gsap.fromTo(element, fadeUp.from, {
        ...fadeUp.to,
        scrollTrigger: {
          once: true,
          start,
          trigger: element,
        },
      });
    },
    { dependencies: [disabled, start], scope },
  );

  return (
    <div ref={scope} {...props}>
      {children}
    </div>
  );
}
