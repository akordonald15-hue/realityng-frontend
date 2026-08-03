import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArtisanProfileForm } from "@/components/services/artisan-profile-form";
import type { OwnerServiceProvider } from "@/lib/api/services";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getMyProviderProfile: vi.fn(),
  getTradeCategories: vi.fn(),
  listProviderTrades: vi.fn(),
  listServiceAreas: vi.fn(),
  updateMyProviderProfile: vi.fn(),
  createProviderTrade: vi.fn(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    getMyProviderProfile: () => mocks.getMyProviderProfile(),
    getTradeCategories: () => mocks.getTradeCategories(),
    listProviderTrades: () => mocks.listProviderTrades(),
    listServiceAreas: () => mocks.listServiceAreas(),
    updateMyProviderProfile: (payload: unknown) => mocks.updateMyProviderProfile(payload),
    createProviderTrade: (payload: unknown) => mocks.createProviderTrade(payload),
  };
});

const category = {
  id: "cat-electrical",
  name: "Electrical",
  slug: "electrical",
  parent: null,
  description: "Electrical repairs.",
  icon: "zap",
  display_order: 10,
  requires_certification: true,
  is_active: true,
  children: [],
};

const profile: OwnerServiceProvider = {
  id: "provider-1",
  slug: "bright-spark",
  status: "draft",
  provider_type: "individual",
  business_name: "Bright Spark",
  headline: "Electrical repairs",
  biography: "Residential repairs.",
  phone: "+2348012345678",
  email: "hello@example.com",
  country: "Nigeria",
  state: "Lagos",
  city: "Lagos",
  lga: "Eti-Osa",
  neighborhood: "Lekki",
  display_location: "Lekki, Lagos",
  private_address: "Private address",
  verification_badges: [],
  average_rating: "0.00",
  completed_jobs_count: 0,
  trades: [],
  primary_trade: null,
  service_areas: [],
  created_at: "2026-08-01T08:00:00Z",
  completion: {
    is_complete: false,
    missing_fields: ["Primary trade"],
    warnings: ["Profile must be approved before it is public."],
  },
  portfolio_count: 0,
};

describe("ArtisanProfileForm", () => {
  beforeEach(() => {
    mocks.getMyProviderProfile.mockResolvedValue(profile);
    mocks.getTradeCategories.mockResolvedValue([category]);
    mocks.listProviderTrades.mockResolvedValue([]);
    mocks.listServiceAreas.mockResolvedValue([]);
    mocks.updateMyProviderProfile.mockResolvedValue(profile);
    mocks.createProviderTrade.mockResolvedValue({
      id: "trade-1",
      category,
      is_primary: true,
      years_experience: 4,
      skill_level: "intermediate",
    });
  });

  it("renders profile fields and readiness checklist", async () => {
    renderWithQueryClient(<ArtisanProfileForm initialProfile={profile} />);

    expect(screen.getByRole("heading", { name: "Manage public provider profile" }))
      .toBeInTheDocument();
    expect(await screen.findByText("Primary trade")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bright Spark")).toBeInTheDocument();
  });

  it("saves draft profile changes", async () => {
    renderWithQueryClient(<ArtisanProfileForm initialProfile={profile} />);

    fireEvent.change(screen.getByDisplayValue("Bright Spark"), {
      target: { value: "Bright Spark Electrical" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() =>
      expect(mocks.updateMyProviderProfile).toHaveBeenCalledWith(
        expect.objectContaining({ business_name: "Bright Spark Electrical" }),
      ),
    );
  });

  it("renders API-driven trade categories", async () => {
    renderWithQueryClient(<ArtisanProfileForm initialProfile={profile} />);

    expect(await screen.findByRole("option", { name: /Electrical/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Trade category" })).toBeInTheDocument();
  });
});
