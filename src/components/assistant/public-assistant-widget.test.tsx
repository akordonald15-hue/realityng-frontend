import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({
    isAuthenticated: false,
  }),
}));

describe("PublicAssistantWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
