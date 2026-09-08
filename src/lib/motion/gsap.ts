"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __realityngMotion?: {
      scrollTriggerCount: () => number;
    };
  }
}

let pluginsRegistered = false;

export function registerGsapPlugins() {
  if (typeof window === "undefined" || pluginsRegistered) {
    return;
  }

  if (process.env.NODE_ENV === "test") {
    pluginsRegistered = true;
    return;
  }

  gsap.registerPlugin(ScrollTrigger, useGSAP);
  pluginsRegistered = true;

  if (process.env.NODE_ENV !== "production") {
    window.__realityngMotion = {
      scrollTriggerCount: () => ScrollTrigger.getAll().length,
    };
  }
}

export function getScrollTriggerCount() {
  if (typeof window === "undefined") {
    return 0;
  }

  return ScrollTrigger.getAll().length;
}

export { gsap, ScrollTrigger, useGSAP };
