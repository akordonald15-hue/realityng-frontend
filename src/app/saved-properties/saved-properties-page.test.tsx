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
});
