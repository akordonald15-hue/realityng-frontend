import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ServicesPage from "@/app/(public)/services/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getServiceProviders: vi.fn(),
  getTradeCategories: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/services",
  useRouter: () => ({
    push: vi.fn(),
    replace: mocks.replace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    getServiceProviders: (filters: Record<string, string>) =>
      mocks.getServiceProviders(filters),
    getTradeCategories: () => mocks.getTradeCategories(),
  };
});

const categories = [
  {
    id: "cat-repairs",
    name: "Repairs",
    slug: "repairs",
    parent: null,
    description: "Repair and maintenance services.",
    icon: "wrench",
    display_order: 10,
    requires_certification: false,
    is_active: true,
    children: [
      {
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
    ],
  },
];

const provider = {
  id: "provider-1",
  slug: "bright-spark-electrical",
  provider_type: "individual",
  business_name: "Bright Spark Electrical",
  headline: "Verified electrical repairs across Lagos",
  biography: "Residential wiring and inverter setup.",
  phone: "+2348012345678",
  email: "hello@example.com",
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
      category: categories[0].children[0],
      is_primary: true,
      years_experience: 8,
      skill_level: "expert",
    },
  ],
  primary_trade: {
    id: "trade-1",
    category: categories[0].children[0],
    is_primary: true,
    years_experience: 8,
    skill_level: "expert",
  },
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
  created_at: "2026-07-31T08:00:00Z",
};

describe("ServicesPage", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.getTradeCategories.mockResolvedValue(categories);
    mocks.getServiceProviders.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [provider],
    });
  });

  it("renders service categories and approved providers", async () => {
    renderWithQueryClient(<ServicesPage />);

    expect(
      screen.getByRole("heading", { name: "Find trusted property services in Nigeria." }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Repairs")).toBeInTheDocument();
    expect(await screen.findByText("Bright Spark Electrical")).toBeInTheDocument();
    expect(screen.getByText("Identity Verified")).toBeInTheDocument();
  });

  it("submits service search filters to the API and URL", async () => {
    renderWithQueryClient(<ServicesPage />);

    fireEvent.change(await screen.findByLabelText("Keyword"), {
      target: { value: "electrician" },
    });
    expect(await screen.findByRole("option", { name: "Electrical" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "electrical" } });
    fireEvent.change(screen.getByLabelText("State"), { target: { value: "Lagos" } });
    fireEvent.click(screen.getByRole("button", { name: "Search services" }));

    await waitFor(() =>
      expect(mocks.getServiceProviders).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "electrician",
          category: "electrical",
          state: "Lagos",
        }),
      ),
    );
    expect(mocks.replace).toHaveBeenLastCalledWith(
      expect.stringContaining("/services?"),
      { scroll: false },
    );
    const [url] = mocks.replace.mock.calls[mocks.replace.mock.calls.length - 1] as [
      string,
      { scroll: boolean },
    ];
    expect(url).toContain("search=electrician");
    expect(url).toContain("category=electrical");
    expect(url).toContain("state=Lagos");
  });

  it("renders an empty state when no providers match", async () => {
    mocks.getServiceProviders.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    renderWithQueryClient(<ServicesPage />);

    expect(await screen.findByText("No service providers found")).toBeInTheDocument();
  });
});
