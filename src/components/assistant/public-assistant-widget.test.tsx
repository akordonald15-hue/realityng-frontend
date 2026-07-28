import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicAssistantWidget } from "@/components/assistant/public-assistant-widget";

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({
    isAuthenticated: false,
  }),
}));

describe("PublicAssistantWidget", () => {
  it("opens on the landing page with a public RealityNG AI introduction", () => {
    render(<PublicAssistantWidget />);

    expect(screen.getByRole("heading", { name: "RealityNG AI" })).toBeInTheDocument();
    expect(screen.getByText("Public walkthrough. No account required.")).toBeInTheDocument();
    expect(screen.getByText(/Hi, I am RealityNG AI/i)).toBeInTheDocument();
    expect(screen.getByText("Browse properties")).toHaveAttribute("href", "/properties");
  });

  it("answers supported walkthrough questions locally", () => {
    render(<PublicAssistantWidget />);

    fireEvent.change(screen.getByLabelText("Ask RealityNG AI"), {
      target: { value: "How do I search for property?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByText(/Use the search tabs for Buy, Rent, Shortlets/i))
      .toBeInTheDocument();
  });

  it("returns a limited-capability response for unsupported requests", () => {
    render(<PublicAssistantWidget />);

    fireEvent.change(screen.getByLabelText("Ask RealityNG AI"), {
      target: { value: "Predict prices next year" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByText(/I do not provide legal advice, prices, availability/i))
      .toBeInTheDocument();
  });
});
