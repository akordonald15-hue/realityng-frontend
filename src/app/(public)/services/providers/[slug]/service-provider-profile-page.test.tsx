import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ServiceProviderProfilePage from "@/app/(public)/services/providers/[slug]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getServiceProvider: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "bright-spark-electrical" }),
  usePathname: () => "/services/providers/bright-spark-electrical",
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    getServiceProvider: (slug: string) => mocks.getServiceProvider(slug),
  };
});

describe("ServiceProviderProfilePage", () => {
  beforeEach(() => {
    mocks.getServiceProvider.mockResolvedValue({
      id: "provider-1",
      slug: "bright-spark-electrical",
      provider_type: "individual",
      business_name: "Bright Spark Electrical",
      headline: "Verified electrical repairs across Lagos",
      biography: "Residential wiring and inverter setup.",
      country: "Nigeria",
      state: "Lagos",
      city: "Lagos",
      lga: "Eti-Osa",
      neighborhood: "Lekki",
      display_location: "Lekki, Lagos",
      verification_badges: [{ label: "Identity Verified", status: "approved" }],
      average_rating: "4.70",
      completed_jobs_count: 12,
      trades: [
        {
          id: "trade-1",
          category: {
            id: "cat-electrical",
            name: "Electrical",
            slug: "electrical",
            parent: "cat-repairs",
            description: "Electrical repairs.",
            icon: "zap",
            display_order: 10,
            requires_certification: true,
            is_active: true,
            children: [],
          },
          is_primary: true,
          years_experience: 8,
          skill_level: "expert",
        },
      ],
      primary_trade: null,
      service_areas: [
        {
          id: "area-1",
          country: "Nigeria",
          state: "Lagos",
          city: "Lagos",
          lga: "Eti-Osa",
          neighborhood: "Lekki",
          service_radius_km: 15,
        },
      ],
      portfolio: {
        items: [],
        message: "Portfolio uploads will be available in Sprint 9.2.",
      },
      reviews_summary: {
        average_rating: "4.70",
        completed_jobs_count: 12,
        review_count: 0,
        message: "Verified booking reviews will be available in a later Sprint 9 phase.",
      },
      created_at: "2026-07-31T08:00:00Z",
    });
  });

  it("renders provider profile with disabled future quote action", async () => {
    renderWithQueryClient(<ServiceProviderProfilePage />);

    expect(await screen.findByRole("heading", { name: "Bright Spark Electrical" }))
      .toBeInTheDocument();
    expect(screen.getAllByText("Identity Verified").length).toBeGreaterThan(0);
    expect(screen.getByText("Portfolio uploads will be available in Sprint 9.2."))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request Quote" })).toBeDisabled();
  });
});
