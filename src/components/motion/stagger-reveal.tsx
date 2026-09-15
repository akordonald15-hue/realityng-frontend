"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { gsap, registerGsapPlugins, useGSAP } from "@/lib/motion/gsap";
import { staggerChildren } from "@/lib/motion/presets";

type StaggerRevealProps = HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section";
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
  as: Component = "div",
  childSelector = "[data-motion-child]",
  children,
  disabled = false,
  duration = staggerChildren.duration,
  stagger = staggerChildren.amount,
  start = "top 84%",
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

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const revealY = isMobile ? Math.min(y, 24) : y;
      const revealDuration = isMobile ? Math.min(duration, 0.72) : duration;
      const revealStagger = isMobile ? Math.min(stagger, 0.08) : stagger;

      gsap.fromTo(
        childrenToReveal,
        { autoAlpha: trigger === "scroll" ? 1 : 0, y: revealY },
        {
          autoAlpha: 1,
          duration: revealDuration,
          ease: staggerChildren.ease,
          stagger: revealStagger,
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
    <Component ref={scope} {...props}>
      {children}
    </Component>
  );
}

