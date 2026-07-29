import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PropertyMapPanel } from "@/components/maps/property-map-panel";
import type { Property } from "@/lib/api/properties";
import { renderWithQueryClient } from "@/test/render";

const property: Property = {
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
  address: "Lekki Phase 1, Lagos",
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
  is_favorited: false,
  created_at: "2026-06-18T00:00:00Z",
};

describe("PropertyMapPanel", () => {
  it("shows a graceful fallback when the Google Maps key is unavailable", async () => {
    renderWithQueryClient(<PropertyMapPanel properties={[property]} />);

    expect(await screen.findByText("Map preview is ready.")).toBeInTheDocument();
    expect(screen.getByText("Approved Lekki Apartment")).toBeInTheDocument();
  });

  it("allows selecting a map-ready property from the fallback list", async () => {
    const user = userEvent.setup();
    const onSelectProperty = vi.fn();

    renderWithQueryClient(
      <PropertyMapPanel onSelectProperty={onSelectProperty} properties={[property]} />,
    );

    await user.click(await screen.findByRole("button", { name: /Approved Lekki Apartment/i }));

    await waitFor(() => expect(onSelectProperty).toHaveBeenCalledWith("property-1"));
  });
});
