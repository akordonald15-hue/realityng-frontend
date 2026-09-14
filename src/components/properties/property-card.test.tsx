import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/lib/api/properties";
import { clearTokens, setTokens } from "@/lib/auth/token-storage";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
  isAuthenticated: false,
  requireAuth: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("@/components/auth/reality-auth-modal", () => ({
  useRealityAuthModal: () => ({ requireAuth: mocks.requireAuth }),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    createFavorite: (propertyId: string) => mocks.createFavorite(propertyId),
    deleteFavorite: (propertyId: string) => mocks.deleteFavorite(propertyId),
  };
});

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
  address: "Lekki Phase 1",
  bedrooms: 3,
  bathrooms: 3,
  parking_spaces: 2,
  land_size: null,
  floor_area: "180.00",
  featured: false,
  is_favorited: false,
  created_at: "2026-06-18T00:00:00Z",
};

describe("PropertyCard favorites", () => {
  beforeEach(() => {
    clearTokens();
    mocks.createFavorite.mockReset();
    mocks.deleteFavorite.mockReset();
    mocks.requireAuth.mockReset();
    mocks.isAuthenticated = false;
  });

  it("saves and removes a property with optimistic button state", async () => {
    const user = userEvent.setup();
    mocks.isAuthenticated = true;
    setTokens("access-token", "refresh-token");
    mocks.createFavorite.mockResolvedValueOnce({
      id: "favorite-1",
      property: { ...property, is_favorited: true },
      created_at: "2026-06-18T00:00:00Z",
    });
    mocks.deleteFavorite.mockResolvedValueOnce(undefined);

    renderWithQueryClient(<PropertyCard property={property} />);

    await user.click(screen.getByRole("button", { name: "Save property" }));
    expect(screen.getByRole("button", { name: "Remove saved property" })).toBeInTheDocument();
    await waitFor(() => expect(mocks.createFavorite).toHaveBeenCalledWith("property-1"));

    await user.click(screen.getByRole("button", { name: "Remove saved property" }));
    expect(screen.getByRole("button", { name: "Save property" })).toBeInTheDocument();
    await waitFor(() => expect(mocks.deleteFavorite).toHaveBeenCalledWith("property-1"));
  });

  it("opens the Reality auth modal before saving for anonymous users", async () => {
    const user = userEvent.setup();
    mocks.requireAuth.mockResolvedValueOnce(false);

    renderWithQueryClient(<PropertyCard property={property} variant="reality" />);

    await user.click(screen.getByRole("button", { name: "Save property" }));

    expect(mocks.requireAuth).toHaveBeenCalledWith({
      actionLabel: "Save property",
      nextPath: "/properties/approved-lekki-apartment",
      onAuthenticated: expect.any(Function),
      role: "buyer",
    });
    expect(screen.queryByText("CREATE AN ACCOUNT TO CONTINUE")).not.toBeInTheDocument();
    expect(mocks.createFavorite).not.toHaveBeenCalled();
  });
});

