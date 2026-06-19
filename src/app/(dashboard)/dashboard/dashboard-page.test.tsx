import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/(dashboard)/dashboard/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getDashboardSummary: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    getDashboardSummary: () => mocks.getDashboardSummary(),
  };
});

describe("DashboardPage", () => {
  it("renders quick stats and quick actions", async () => {
    mocks.getDashboardSummary.mockResolvedValueOnce({
      saved_properties_count: 2,
      active_listings_count: 1,
      draft_listings_count: 3,
    });

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Saved properties")).toBeInTheDocument();
    expect(screen.getByText("Active listings")).toBeInTheDocument();
    expect(screen.getByText("Draft listings")).toBeInTheDocument();
    expect(screen.getByText("View saved properties")).toBeInTheDocument();
    expect(screen.getByText("Browse properties")).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
