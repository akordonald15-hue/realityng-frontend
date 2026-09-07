import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PropertyDetailPage from "@/app/(public)/properties/[slug]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getPublicProperty: vi.fn(),
  getPublicProperties: vi.fn(),
  listPublicWalkthroughs: vi.fn(),
  clipboardWriteText: vi.fn(),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    getPublicProperty: (slug: string) => mocks.getPublicProperty(slug),
    getPublicProperties: (filters: Record<string, string>) => mocks.getPublicProperties(filters),
  };
});

vi.mock("@/lib/api/inspections", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/inspections")>("@/lib/api/inspections");
  return {
    ...actual,
    listPublicWalkthroughs: (propertyId: string) => mocks.listPublicWalkthroughs(propertyId),
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
    featured: true,
    cover_image_url: "https://cdn.example.com/cover.jpg",
    image_count: 2,
    image_gallery: [
      {
        id: "image-1",
        image_url: "https://cdn.example.com/cover.jpg",
        caption: "Cover",
        display_order: 1,
        is_cover: true,
        created_at: "2026-06-18T00:00:00Z",
      },
      {
        id: "image-2",
        image_url: "https://cdn.example.com/kitchen.jpg",
        caption: "Kitchen",
        display_order: 2,
        is_cover: false,
        created_at: "2026-06-18T00:00:00Z",
      },
    ],
    agent_name: "Tunde Balogun",
    agent_email: "agent@realityng.com",
    agent_avatar_url: null,
    amenities: ["Pool", "24/7 security"],
    is_favorited: false,
    created_at: "2026-06-18T00:00:00Z",
    ...overrides,
  };
}

function similarProperty() {
  return property({
    id: "property-2",
    title: "Ikoyi Apartment",
    slug: "ikoyi-apartment",
    display_location: "Ikoyi, Lagos",
  });
}

describe("PropertyDetailPage", () => {
  beforeEach(() => {
    mocks.getPublicProperty.mockReset();
    mocks.getPublicProperties.mockReset();
    mocks.listPublicWalkthroughs.mockReset();
    mocks.clipboardWriteText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: mocks.clipboardWriteText },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });

  it("renders property media, facts, actions, representative data, map, showcase, similar results, and SEO", async () => {
    mocks.getPublicProperty.mockResolvedValue(property());
    mocks.listPublicWalkthroughs.mockResolvedValue([
      {
        id: "walkthrough-1",
        property: "property-1",
        title: "Inspection walkthrough",
        description: "Moderated inspection video.",
        video_url: "https://cdn.example.com/video.mp4",
        thumbnail_url: "https://cdn.example.com/thumb.jpg",
        status: "approved",
        is_featured: true,
        created_at: "2026-06-18T00:00:00Z",
      },
    ]);
    mocks.getPublicProperties.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [property(), similarProperty()],
    });

    renderWithQueryClient(<PropertyDetailPage />);

    expect(await screen.findAllByText("Lekki Phase 1, Lagos")).not.toHaveLength(0);
    expect(screen.getByText(/2,500,000/)).toBeInTheDocument();
    expect(screen.getByText("Bedrooms")).toBeInTheDocument();
    expect(screen.getByText("Bathrooms")).toBeInTheDocument();
    expect(screen.getByText("Pool")).toBeInTheDocument();
    expect(screen.getByText("Tunde Balogun")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apply for this property" })).toHaveAttribute(
      "href",
      "/apply/property-1?slug=approved-lekki-apartment",
    );
    expect(screen.getByRole("link", { name: "Request inspection" })).toHaveAttribute(
      "href",
      "/properties/approved-lekki-apartment/request-inspection",
    );
    expect(screen.getAllByRole("button", { name: "Show interest" })[0]).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to comparison: Approved Lekki Apartment" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Save property" })).not.toHaveLength(0);
    expect(await screen.findByText("Map preview is ready.")).toBeInTheDocument();
    expect(await screen.findByText("Inspection walkthrough")).toBeInTheDocument();
    expect(await screen.findByText("Similar properties")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Ikoyi Apartment" })).toBeInTheDocument();

    const jsonLd = document.querySelector("#realityng-property-jsonld");
    expect(jsonLd).toBeInTheDocument();
    expect(jsonLd?.textContent).toContain("Approved Lekki Apartment");
  });

  it("falls back gracefully when optional media and representative data are missing", async () => {
    mocks.getPublicProperty.mockResolvedValue(
      property({
        cover_image_url: "",
        image_count: 0,
        image_gallery: [],
        agent_name: undefined,
        agent_email: undefined,
        amenities: [],
        latitude: null,
        longitude: null,
      }),
    );
    mocks.listPublicWalkthroughs.mockResolvedValue([]);
    mocks.getPublicProperties.mockResolvedValue({ count: 1, next: null, previous: null, results: [] });

    renderWithQueryClient(<PropertyDetailPage />);

    expect(await screen.findAllByText("RealityNG")).not.toHaveLength(0);
    expect(screen.getByText("Contact us through inquiry")).toBeInTheDocument();
    expect(screen.getByText("No map-ready listings yet.")).toBeInTheDocument();
    expect(screen.getByText("No moderated video yet")).toBeInTheDocument();
  });

  it("copies the property URL when share is used without native share support", async () => {
    mocks.getPublicProperty.mockResolvedValue(property());
    mocks.listPublicWalkthroughs.mockResolvedValue([]);
    mocks.getPublicProperties.mockResolvedValue({ count: 1, next: null, previous: null, results: [] });

    renderWithQueryClient(<PropertyDetailPage />);

    await screen.findAllByText("Lekki Phase 1, Lagos");
    fireEvent.click(screen.getAllByRole("button", { name: "Share" })[0]);

    await waitFor(() =>
      expect(mocks.clipboardWriteText).toHaveBeenCalledWith(
        "http://localhost:3000/properties/approved-lekki-apartment",
      ),
    );
  });

  it("renders the existing unavailable-property state", async () => {
    mocks.getPublicProperty.mockRejectedValue(new Error("Not found"));

    renderWithQueryClient(<PropertyDetailPage />);

    expect(await screen.findByText("Property could not be loaded.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse properties" })).toHaveAttribute(
      "href",
      "/properties",
    );
  });
});
