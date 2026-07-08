import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PropertyDetailPage from "@/app/(public)/properties/[slug]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getPublicProperty: vi.fn(),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    getPublicProperty: (slug: string) => mocks.getPublicProperty(slug),
  };
});

describe("PropertyDetailPage", () => {
  it("renders gallery, price, details, amenities, and show interest action", async () => {
    mocks.getPublicProperty.mockResolvedValue({
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
      address: "Lekki Phase 1",
      bedrooms: 3,
      bathrooms: 3,
      parking_spaces: 2,
      land_size: null,
      floor_area: "180.00",
      featured: true,
      cover_image_url: "https://cdn.example.com/cover.jpg",
      image_count: 1,
      image_gallery: [
        {
          id: "image-1",
          image_url: "https://cdn.example.com/cover.jpg",
          caption: "Cover",
          display_order: 1,
          is_cover: true,
          created_at: "2026-06-18T00:00:00Z",
        },
      ],
      agent_name: "Tunde Balogun",
      agent_email: "agent@realityng.com",
      amenities: ["Pool", "24/7 security"],
      created_at: "2026-06-18T00:00:00Z",
    });

    renderWithQueryClient(<PropertyDetailPage />);

    expect(
      await screen.findByRole("heading", { name: "Approved Lekki Apartment" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2,500,000/)).toBeInTheDocument();
    expect(screen.getByText("Property details")).toBeInTheDocument();
    expect(screen.getByText("Amenities")).toBeInTheDocument();
    expect(screen.getByText("Tunde Balogun")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show interest" })).toBeInTheDocument();
  });
});
