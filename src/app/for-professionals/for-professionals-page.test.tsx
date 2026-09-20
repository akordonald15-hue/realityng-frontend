import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ForProfessionalsPage from "@/app/for-professionals/page";

const authMocks = vi.hoisted(() => ({
  auth: null as unknown,
}));

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => authMocks.auth,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/for-professionals",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

function roleUser(role: "agent" | "landlord", status: "approved" | "pending" | "rejected" = "approved") {
  return {
    id: `${role}-1`,
    email: `${role}@example.test`,
    full_name: `${role} User`,
    roles: [
      {
        id: `${role}-role`,
        role: {
          id: role,
          name: role,
          description: role,
          created_at: "2026-01-01T00:00:00Z",
          approval_required: true,
        },
        status,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
  };
}

describe("ForProfessionalsPage", () => {
  beforeEach(() => {
    authMocks.auth = null;
  });

  it("renders the public Agent and Landlord business homepage", () => {
    render(<ForProfessionalsPage />);

    expect(
      screen.getByRole("heading", {
        name: /Get your property or service in front of the right people/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Property Owners" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agents" })).toBeInTheDocument();
    expect(screen.getByText("Showcase your services")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Explore Artisans" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Discover Artisans" })[0]).toHaveAttribute(
      "href",
      "/services",
    );
  });

  it("describes the professional journey in the How it works section", () => {
    render(<ForProfessionalsPage />);

    expect(screen.getByRole("heading", { level: 2, name: "How it works" })).toBeInTheDocument();
    expect(screen.getByText(/List, manage, and grow in one workspace/i)).toBeInTheDocument();

    for (const step of [
      "Join & Verify",
      "List Your Property",
      "Manage Leads & Requests",
      "Close & Grow",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: step })).toBeInTheDocument();
    }

    // The B2C buyer journey must not leak into the professional page.
    expect(screen.queryByRole("heading", { level: 3, name: "Search" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Inspection" })).not.toBeInTheDocument();
  });

  it("keeps process step icons decorative for screen readers", () => {
    const { container } = render(<ForProfessionalsPage />);

    const steps = container.querySelectorAll(".process-step-visual");
    expect(steps).toHaveLength(4);
    expect(container.querySelectorAll(".process-step-card")).toHaveLength(0);

    for (const step of Array.from(steps)) {
      const svg = step.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("routes unauthenticated role CTAs into the existing sign-up continuation flow", () => {
    render(<ForProfessionalsPage />);

    expect(
      screen
        .getAllByRole("link", { name: "List a Property" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/properties/new",
        ),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Join as an Agent" })
        .some((link) => link.getAttribute("href") === "/dashboard"),
    ).toBe(true);
  });

  it("routes approved supply users back to the dashboard", () => {
    authMocks.auth = {
      isAuthenticated: true,
      isLoading: false,
      user: roleUser("agent"),
    };

    render(<ForProfessionalsPage />);

    expect(screen.getAllByRole("link", { name: "Go to Dashboard" })[0]).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("does not treat pending professional users as approved", () => {
    authMocks.auth = {
      isAuthenticated: true,
      isLoading: false,
      user: roleUser("landlord", "pending"),
    };

    render(<ForProfessionalsPage />);

    expect(screen.getAllByRole("link", { name: "Check verification" })[0]).toHaveAttribute(
      "href",
      "/verification",
    );
  });
});
