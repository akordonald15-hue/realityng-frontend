import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({
    isAuthenticated: false,
  }),
}));

function setViewportWidth(width: number) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const minWidth = /\(min-width:\s*(\d+)px\)/.exec(query);
      return {
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: minWidth ? width >= Number(minWidth[1]) : false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      };
    }),
  });
}

describe("PublicAssistantWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setViewportWidth(1280);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  function revealAssistant() {
    act(() => {
      vi.advanceTimersByTime(1500);
    });
  }

  function openAssistant() {
    revealAssistant();
    fireEvent.click(screen.getByRole("button", { name: "Open RealityNG AI" }));
  }

  it("introduces itself as a floating public RealityNG AI assistant", () => {
    render(<PublicAssistantWidget />);
    revealAssistant();

    expect(screen.getAllByText("RealityNG AI").length).toBeGreaterThan(0);
    expect(screen.getByText(/Welcome to RealityNG/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open RealityNG AI" }));

    expect(screen.getByRole("heading", { name: "RealityNG AI" })).toBeInTheDocument();
    expect(screen.getByText("Public walkthrough. No account required.")).toBeInTheDocument();
    expect(screen.getByText(/I'm your AI property assistant/i)).toBeInTheDocument();
    expect(screen.getByText("Browse properties")).toHaveAttribute("href", "/properties");
  });

  it("keeps the closed overlay pointer-transparent and provides an accessible close control", () => {
    render(<PublicAssistantWidget />);
    revealAssistant();
    const launcher = screen.getByRole("button", { name: "Open RealityNG AI" });
    expect(launcher.parentElement).toHaveClass("pointer-events-none");
    expect(launcher).toHaveClass("pointer-events-auto");
    fireEvent.click(launcher);
    const close = screen.getByRole("button", { name: "Close RealityNG AI" });
    expect(close.querySelector("svg")).toBeInTheDocument();
    fireEvent.click(close);
    expect(screen.getByRole("button", { name: "Open RealityNG AI" })).toBeInTheDocument();
  });

  it("does not auto-expand a greeting panel over page content on phones", () => {
    setViewportWidth(390);
    render(<PublicAssistantWidget />);
    revealAssistant();

    // The launcher still appears, but nothing overlays the page until it is tapped.
    expect(screen.getByRole("button", { name: "Open RealityNG AI" })).toBeInTheDocument();
    expect(screen.queryByText(/Welcome to RealityNG/i)).not.toBeInTheDocument();
  });

  it("still opens on an explicit tap at phone width", () => {
    setViewportWidth(390);
    render(<PublicAssistantWidget />);
    openAssistant();

    expect(screen.getByRole("heading", { name: "RealityNG AI" })).toBeInTheDocument();
    expect(screen.getByText(/I'm your AI property assistant/i)).toBeInTheDocument();
  });

  it("answers supported walkthrough questions locally", () => {
    render(<PublicAssistantWidget />);
    openAssistant();

    fireEvent.change(screen.getByLabelText("Ask RealityNG AI"), {
      target: { value: "How do I search for property?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByText(/Use the search tabs for Buy, Rent, Shortlets/i))
      .toBeInTheDocument();
  });

  it("returns a limited-capability response for unsupported requests", () => {
    render(<PublicAssistantWidget />);
    openAssistant();

    fireEvent.change(screen.getByLabelText("Ask RealityNG AI"), {
      target: { value: "Predict prices next year" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByText(/I do not provide legal advice, prices, availability/i))
      .toBeInTheDocument();
  });
});

