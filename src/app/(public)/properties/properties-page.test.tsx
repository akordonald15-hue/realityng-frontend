import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PropertiesPage from "@/app/(public)/properties/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getPublicProperties: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "approved-lekki-apartment" }),
  usePathname: () => "/properties",
  useRouter: () => ({
    push: vi.fn(),
    replace: mocks.replace,
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
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

describe("PropertiesPage", () => {
  it("renders approved listings and sends filters to the API", async () => {
    mocks.replace.mockReset();
    mocks.getPublicProperties.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
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
        },
      ],
    });

    renderWithQueryClient(<PropertiesPage />);

    expect(await screen.findByText("Approved Lekki Apartment")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("Listing type"), { target: { value: "rent" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(mocks.getPublicProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: "Lagos", listing_type: "rent" }),
      ),
    );
    expect(mocks.replace).toHaveBeenLastCalledWith(
      "/properties?city=Lagos&listing_type=rent",
      { scroll: false },
    );
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("button", { name: "List" })).toHaveClass("bg-brand-secondary");

    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    expect(await screen.findByText("Map preview is ready.")).toBeInTheDocument();
  });
});
