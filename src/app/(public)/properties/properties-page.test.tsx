import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PropertiesPage from "@/app/(public)/properties/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getPublicProperties: vi.fn(),
  replace: vi.fn(),
  search: "",
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "approved-lekki-apartment" }),
  usePathname: () => "/properties",
  useRouter: () => ({
    push: vi.fn(),
    replace: mocks.replace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/properties")>(
    "@/lib/api/properties",
  );
  return {
    ...actual,
    getPublicProperties: (filters: Record<string, string>) =>
      mocks.getPublicProperties(filters),
  };
});

function property(overrides: Record<string, unknown> = {}) {
  return {
    id: "property-1",
    title: "Approved Lekki Apartment",
    slug: "approved-lekki-apartment",
    description: "A verified rental apartment close to major roads.",
    property_type: "apartment",
    listing_type: "rent",
    price: "2500000.00",
    currency: "NGN",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    lga: "Eti-Osa",
    neighborhood: "Lekki Phase 1",
    landmark: "Admiralty Way",
    address: "Lekki Phase 1",
    latitude: "6.470",
    longitude: "3.585",
    location_precision: "neighborhood",
    approximate_location: true,
    geocoding_status: "manual",
    display_location: "Lekki Phase 1, Lagos",
    location_metadata: {
      has_map_location: true,
      precision_label: "Neighborhood",
      privacy_note: "Location is approximate for privacy.",
    },
    bedrooms: 3,
    bathrooms: 3,
    parking_spaces: 2,
    land_size: null,
    floor_area: "180.00",
    featured: false,
    created_at: "2026-06-18T00:00:00Z",
    ...overrides,
  };
}

function mockResults(results = [property()]) {
  mocks.getPublicProperties.mockResolvedValue({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
}

describe("PropertiesPage", () => {
  beforeEach(() => {
    mocks.search = "";
    mocks.replace.mockReset();
    mocks.getPublicProperties.mockReset();
  });

  it("renders Reality property results with URL-backed filters", async () => {
    mocks.search = "city=Lagos&listing_type=rent&property_type=apartment&max_price=5000000";
    mockResults();

    renderWithQueryClient(<PropertiesPage />);

    expect(await screen.findByText("Explore Properties")).toBeInTheDocument();
    expect(await screen.findByText("Lekki Phase 1, Lagos")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View Approved Lekki Apartment" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toHaveValue("Lagos");
    expect(screen.getByLabelText("Listing type")).toHaveTextContent("For rent");
    expect(screen.getByLabelText("Property type")).toHaveTextContent("Apartment");
    expect(screen.getByLabelText("Maximum price")).toHaveTextContent("Up to ₦5m");

    await waitFor(() =>
      expect(mocks.getPublicProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          city: "Lagos",
          listing_type: "rent",
          max_price: "5000000",
          ordering: "-featured",
          property_type: "apartment",
        }),
      ),
    );
  });

  it("updates supported filters in the query string", async () => {
    const user = userEvent.setup();
    mockResults();

    renderWithQueryClient(<PropertiesPage />);

    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "Abuja" } });
    await user.click(screen.getByLabelText("Listing type"));
    await user.click(screen.getByRole("option", { name: "For sale" }));
    await user.click(screen.getByLabelText("Property type"));
    await user.click(screen.getByRole("option", { name: "Duplex" }));
    await user.click(screen.getByLabelText("Maximum price"));
    await user.click(screen.getByRole("option", { name: "Up to ₦10m" }));
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/properties?city=Abuja&property_type=duplex&listing_type=sale&max_price=10000000",
      { scroll: false },
    );
  });

  it("preserves filters while switching to map view", async () => {
    mocks.search = "city=Lagos&listing_type=rent";
    mockResults();

    renderWithQueryClient(<PropertiesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Map" }));

    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/properties?city=Lagos&listing_type=rent&view=map",
      { scroll: false },
    );
  });

  it("renders the existing map panel in desktop map mode", async () => {
    mocks.search = "view=map";
    mockResults();

    renderWithQueryClient(<PropertiesPage />);

    expect(await screen.findByText("Approved Lekki Apartment")).toBeInTheDocument();
    expect(await screen.findByText("Map preview is ready.")).toBeInTheDocument();
  });

  it("renders the empty state and can clear filters", async () => {
    mocks.search = "city=Lagos";
    mockResults([]);

    renderWithQueryClient(<PropertiesPage />);

    expect(await screen.findByText("No properties found")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(mocks.replace).toHaveBeenLastCalledWith("/properties", { scroll: false });
  });

  it("renders an error state without replacing route state", async () => {
    mocks.getPublicProperties.mockRejectedValue(new Error("Request failed"));

    renderWithQueryClient(<PropertiesPage />);

    expect(await screen.findByText("Properties could not be loaded.")).toBeInTheDocument();
    expect(within(screen.getByRole("main")).getByText("Explore Properties")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

