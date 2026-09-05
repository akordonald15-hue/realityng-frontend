"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { gsap, registerGsapPlugins, useGSAP } from "@/lib/motion/gsap";
import { subtleParallax } from "@/lib/motion/presets";

type ParallaxMediaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  disabled?: boolean;
};

export function ParallaxMedia({ children, disabled = false, ...props }: ParallaxMediaProps) {
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

      const media = gsap.matchMedia();
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(element, {
          ...subtleParallax,
          scrollTrigger: {
            end: "bottom top",
            invalidateOnRefresh: true,
            scrub: 0.6,
            start: "top bottom",
            trigger: element,
          },
        });
      });

      return () => media.revert();
    },
    { dependencies: [disabled], scope },
  );

  return (
    <div ref={scope} {...props}>
      {children}
    </div>
  );
}
