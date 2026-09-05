"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { gsap, registerGsapPlugins, useGSAP } from "@/lib/motion/gsap";
import { staggerChildren } from "@/lib/motion/presets";

type StaggerRevealProps = HTMLAttributes<HTMLDivElement> & {
  childSelector?: string;
  children: ReactNode;
  disabled?: boolean;
  duration?: number;
  stagger?: number;
  start?: string;
  trigger?: "load" | "scroll";
  y?: number;
};

export function StaggerReveal({
  childSelector = "[data-motion-child]",
  children,
  disabled = false,
  duration = staggerChildren.duration,
  stagger = staggerChildren.amount,
  start = "top 86%",
  trigger = "scroll",
  y = staggerChildren.y,
  ...props
}: StaggerRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();

      if (process.env.NODE_ENV === "test") {
        return;
      }

      const root = scope.current;
      if (!root || disabled) {
        return;
      }

      const childrenToReveal = gsap.utils.toArray<HTMLElement>(childSelector, root);
      if (childrenToReveal.length === 0) {
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        gsap.set(childrenToReveal, { autoAlpha: 1, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        childrenToReveal,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          duration,
          ease: staggerChildren.ease,
          stagger,
          y: 0,
          ...(trigger === "scroll"
            ? {
                scrollTrigger: {
                  once: true,
                  start,
                  trigger: root,
                },
              }
            : {}),
        },
      );
    },
    { dependencies: [childSelector, disabled, duration, stagger, start, trigger, y], scope },
  );

  return (
    <div ref={scope} {...props}>
      {children}
    </div>
  );
}
