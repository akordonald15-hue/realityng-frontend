import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SavedPropertiesPage from "@/app/saved-properties/page";
import { setTokens } from "@/lib/auth/token-storage";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  listFavorites: vi.fn(),
  deleteFavorite: vi.fn(),
  createFavorite: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    listFavorites: (page: number) => mocks.listFavorites(page),
    createFavorite: (propertyId: string) => mocks.createFavorite(propertyId),
    deleteFavorite: (propertyId: string) => mocks.deleteFavorite(propertyId),
  };
});

const favoriteResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: "favorite-1",
      property_id: "property-1",
      is_publicly_available: true,
      created_at: "2026-06-18T00:00:00Z",
      property: {
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
        featured: false,
        is_favorited: true,
        created_at: "2026-06-18T00:00:00Z",
      },
    },
  ],
};

describe("SavedPropertiesPage", () => {
  it("renders saved properties and removes a favorite", async () => {
    const user = userEvent.setup();
    setTokens("access-token", "refresh-token");
    mocks.listFavorites.mockResolvedValue(favoriteResponse);
    mocks.deleteFavorite.mockResolvedValueOnce(undefined);

    renderWithQueryClient(<SavedPropertiesPage />);

    expect(await screen.findByText("Approved Lekki Apartment")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove saved property" }));

    await waitFor(() => expect(mocks.deleteFavorite).toHaveBeenCalledWith("property-1"));
  });

  it("shows a non-navigable unavailable item and removes it by property ID", async () => {
    const user = userEvent.setup();
    mocks.listFavorites.mockResolvedValue({
      ...favoriteResponse,
      results: [{
        id: "favorite-old",
        property_id: "property-old",
        is_publicly_available: false,
        created_at: "2026-06-18T00:00:00Z",
        property: { id: "property-old", title: "Property no longer available" },
      }],
    });
    mocks.deleteFavorite.mockResolvedValueOnce(undefined);

    renderWithQueryClient(<SavedPropertiesPage />);

    expect(await screen.findByText("No longer available")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View property/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove unavailable property from Saved" }));
    await waitFor(() => expect(mocks.deleteFavorite).toHaveBeenCalledWith("property-old"));
  });

  it("keeps active navigation distinct in a mixed saved list", async () => {
    mocks.listFavorites.mockResolvedValue({
      ...favoriteResponse,
      count: 2,
      results: [
        favoriteResponse.results[0],
        { id: "favorite-old", property_id: "property-old", is_publicly_available: false,
          created_at: "2026-06-18T00:00:00Z", property: { id: "property-old", title: "Property no longer available" } },
      ],
    });

    renderWithQueryClient(<SavedPropertiesPage />);

    expect(await screen.findByText("Approved Lekki Apartment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Approved Lekki Apartment" })).toHaveAttribute("href", "/properties/approved-lekki-apartment");
    expect(screen.getByText("No longer available")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View Property no longer available/i })).not.toBeInTheDocument();
  });

  it("offers browsing when Saved is empty", async () => {
    mocks.listFavorites.mockResolvedValue({ ...favoriteResponse, count: 0, results: [] });

    renderWithQueryClient(<SavedPropertiesPage />);

    expect(await screen.findByRole("link", { name: "Browse properties" })).toHaveAttribute("href", "/properties");
  });
});

