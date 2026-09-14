import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ParallaxMedia } from "@/components/motion/parallax-media";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerReveal } from "@/components/motion/stagger-reveal";

const motionMocks = vi.hoisted(() => ({
  gsapFromTo: vi.fn(),
  gsapSet: vi.fn(),
  gsapTo: vi.fn(),
  matchMediaAdd: vi.fn(),
  matchMediaRevert: vi.fn(),
  registerGsapPlugins: vi.fn(),
}));

vi.mock("@/lib/motion/gsap", () => ({
  gsap: {
    fromTo: motionMocks.gsapFromTo,
    matchMedia: () => ({
      add: motionMocks.matchMediaAdd,
      revert: motionMocks.matchMediaRevert,
    }),
    set: motionMocks.gsapSet,
    to: motionMocks.gsapTo,
    utils: {
      toArray: (selector: string, root?: Element) =>
        Array.from((root ?? document).querySelectorAll(selector)),
    },
  },
  registerGsapPlugins: motionMocks.registerGsapPlugins,
  useGSAP: (callback: () => void | (() => void)) => callback(),
}));

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

describe("motion components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReducedMotion(false);
  });

  it("renders scroll reveal children in the normal DOM before enhancement", () => {
    render(
      <ScrollReveal>
        <p>Visible section</p>
      </ScrollReveal>,
    );

    expect(screen.getByText("Visible section")).toBeInTheDocument();
    expect(motionMocks.registerGsapPlugins).toHaveBeenCalled();
  });

  it("keeps children visible when reduced motion is requested", () => {
    mockReducedMotion(true);

    render(
      <StaggerReveal>
        <p data-motion-child>Reduced motion content</p>
      </StaggerReveal>,
    );

    expect(screen.getByText("Reduced motion content")).toBeInTheDocument();
    expect(motionMocks.gsapFromTo).not.toHaveBeenCalled();
  });

  it("limits parallax setup to the reusable media wrapper", () => {
    render(
      <ParallaxMedia>
        <div aria-label="Property gallery" />
      </ParallaxMedia>,
    );

    expect(screen.getByLabelText("Property gallery")).toBeInTheDocument();
    expect(motionMocks.matchMediaAdd).not.toHaveBeenCalled();
  });
});

