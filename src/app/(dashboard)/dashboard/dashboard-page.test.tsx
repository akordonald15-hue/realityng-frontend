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
      activeListings: [],
      leads: [],
      pendingApprovals: [],
      userStats: [],
    });

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Saved properties")).toBeInTheDocument();
    expect(screen.getAllByText("Recently viewed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("My inquiries").length).toBeGreaterThan(0);
    expect(screen.getByText("View saved properties")).toBeInTheDocument();
    expect(screen.getByText("Browse properties")).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
