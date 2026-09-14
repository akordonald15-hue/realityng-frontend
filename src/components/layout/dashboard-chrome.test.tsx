import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardChrome } from "@/components/layout/dashboard-chrome";

const mocks = vi.hoisted(() => ({
  pathname: "/dashboard",
  user: {
    roles: [{ role: { name: "buyer" }, status: "approved" }],
  },
  isLoading: false,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    isLoading: mocks.isLoading,
    user: mocks.user,
  }),
}));

vi.mock("@/components/assistant/assistant-widget", () => ({
  AssistantWidget: () => null,
}));

vi.mock("@/components/layout/navbar", () => ({
  Navbar: ({ variant }: { variant?: string }) => (
    <div data-testid="navbar-variant">{variant ?? "legacy"}</div>
  ),
}));

function roleUser(role: string, status: "pending" | "approved" | "rejected" = "approved") {
  return {
    roles: [{ role: { name: role }, status }],
  };
}

describe("DashboardChrome", () => {
  it("uses Reality chrome for buyers and approved supply users on /dashboard", () => {
    mocks.user = roleUser("buyer");
    render(<DashboardChrome>Buyer</DashboardChrome>);
    expect(screen.getByTestId("navbar-variant")).toHaveTextContent("reality");

    mocks.user = roleUser("agent");
    render(<DashboardChrome>Agent</DashboardChrome>);
    expect(screen.getAllByTestId("navbar-variant").at(-1)).toHaveTextContent("reality");

    mocks.user = roleUser("landlord");
    render(<DashboardChrome>Landlord</DashboardChrome>);
    expect(screen.getAllByTestId("navbar-variant").at(-1)).toHaveTextContent("reality");
  });

  it("uses Reality chrome for admin and non-supply professionals too", () => {
    mocks.user = roleUser("admin");
    render(<DashboardChrome>Admin</DashboardChrome>);
    expect(screen.getByTestId("navbar-variant")).toHaveTextContent("reality");

    mocks.user = roleUser("artisan");
    render(<DashboardChrome>Artisan</DashboardChrome>);
    expect(screen.getAllByTestId("navbar-variant").at(-1)).toHaveTextContent("reality");

    mocks.user = roleUser("landlord", "pending");
    render(<DashboardChrome>Pending landlord</DashboardChrome>);
    expect(screen.getAllByTestId("navbar-variant").at(-1)).toHaveTextContent("reality");
  });
});

