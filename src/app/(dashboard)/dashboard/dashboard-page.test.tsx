import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/(dashboard)/dashboard/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: {
      id: "buyer-1",
      first_name: "Ify",
      roles: [{ role: { name: "buyer" }, status: "approved" }],
    },
  }),
}));

vi.mock("@/lib/api/dashboard", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/dashboard")>("@/lib/api/dashboard");
  return {
    ...actual,
    getDashboardOverview: (user: unknown) => mocks.getDashboardOverview(user),
  };
});

describe("DashboardPage", () => {
  it("renders quick stats and quick actions", async () => {
    mocks.getDashboardOverview.mockResolvedValueOnce({
      role: "buyer",
      metrics: [
        { label: "Saved properties", value: "2", detail: "Shortlisted homes" },
        { label: "Recently viewed", value: "8", detail: "Opened this week" },
        { label: "My inquiries", value: "3", detail: "Agent conversations" },
      ],
      savedProperties: [],
      recentlyViewed: [],
      recommendedProperties: [],
      inquiries: [],
      viewings: [],
      applications: [],
      activeListings: [],
      leads: [],
      receivedViewings: [],
      receivedApplications: [],
      pendingApprovals: [],
      userStats: [],
    });

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Buyer and tenant workspace")).toBeInTheDocument();
    expect(screen.getByText("Your property journey")).toBeInTheDocument();
    expect(screen.getByText("Continue where you left off")).toBeInTheDocument();
    expect((await screen.findAllByText("2")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saved properties").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recently viewed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("My inquiries").length).toBeGreaterThan(0);
    expect(screen.getByText("My viewings")).toBeInTheDocument();
    expect(screen.getByText("My applications")).toBeInTheDocument();
    expect(screen.getAllByText("Search properties").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Verification centre").length).toBeGreaterThan(0);
    expect(screen.getByText("Profile and contact")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
