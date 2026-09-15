import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ManagedPropertiesPage from "@/app/(dashboard)/dashboard/properties/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  currentSearchParams: new URLSearchParams(),
  push: vi.fn(),
  listManagedProperties: vi.fn(),
  currentUser: {
    id: "agent-1",
    first_name: "Tunde",
    roles: [{ role: { name: "agent" }, status: "approved" }],
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/properties",
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => mocks.currentSearchParams,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: mocks.currentUser,
  }),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/properties")>(
    "@/lib/api/properties",
  );
  return {
    ...actual,
    listManagedProperties: (filters: unknown) => mocks.listManagedProperties(filters),
  };
});

function property(overrides = {}) {
  return {
    id: "property-1",
    title: "Waterfront Banana Island Duplex",
    slug: "waterfront-banana-island-duplex",
    description: "Waterfront home",
    property_type: "duplex",
    listing_type: "sale",
    price: "1850000000",
    currency: "NGN",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    address: "Banana Island",
    bedrooms: 5,
    bathrooms: 6,
    parking_spaces: 4,
    floor_area: "820",
    status: "approved",
    featured: true,
    cover_image_url: "https://images.example/property.jpg",
    can_manage_listing: true,
    created_at: "2026-06-03T10:00:00Z",
    ...overrides,
  };
}

function paginated(results = [property()], overrides = {}) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
    ...overrides,
  };
}

describe("ManagedPropertiesPage", () => {
  beforeEach(() => {
    mocks.currentSearchParams = new URLSearchParams();
    mocks.push.mockReset();
    mocks.listManagedProperties.mockReset();
    mocks.listManagedProperties.mockResolvedValue(paginated());
    mocks.currentUser = {
      id: "agent-1",
      first_name: "Tunde",
      roles: [{ role: { name: "agent" }, status: "approved" }],
    };
  });

  it("renders owned or assigned managed properties for approved supply users", async () => {
    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(await screen.findByRole("heading", { name: "My Properties" })).toBeInTheDocument();
    expect(await screen.findByText("Waterfront Banana Island Duplex")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "View listing" })).toHaveAttribute(
      "href",
      "/properties/waterfront-banana-island-duplex",
    );
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/dashboard/properties/waterfront-banana-island-duplex/edit",
    );
  });

  it("does not show edit actions without a backend capability signal", async () => {
    mocks.listManagedProperties.mockResolvedValueOnce(
      paginated([property({ can_manage_listing: false })]),
    );

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(await screen.findByText("Waterfront Banana Island Duplex")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("continues owned drafts through their slug instead of their UUID", async () => {
    mocks.currentUser = {
      id: "landlord-1",
      first_name: "Ada",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.listManagedProperties.mockResolvedValueOnce(
      paginated([property({ id: "uuid-draft-1", slug: "qa-owned-draft", status: "draft" })]),
    );

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(await screen.findByRole("link", { name: "Continue draft" })).toHaveAttribute(
      "href",
      "/dashboard/properties/qa-owned-draft/edit",
    );
  });

  it("uses slugs for assigned rejected properties without owner-only gating", async () => {
    mocks.listManagedProperties.mockResolvedValueOnce(
      paginated([
        property({
          id: "uuid-assigned-1",
          slug: "qa-assigned-rejected",
          status: "rejected",
          owner_id: "different-landlord",
          can_manage_listing: true,
        }),
      ]),
    );

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(await screen.findByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/dashboard/properties/qa-assigned-rejected/edit",
    );
  });

  it("passes URL-backed filters to the management endpoint", async () => {
    mocks.currentSearchParams = new URLSearchParams(
      "status=pending_review&search=Lekki&property_type=house&listing_type=sale&ordering=price&page=2",
    );

    renderWithQueryClient(<ManagedPropertiesPage />);

    await waitFor(() => {
      expect(mocks.listManagedProperties).toHaveBeenCalledWith({
        status: "pending_review",
        search: "Lekki",
        property_type: "house",
        listing_type: "sale",
        city: undefined,
        ordering: "price",
        page: "2",
      });
    });
  });

  it("updates status and resets pagination through the URL", async () => {
    const user = userEvent.setup();
    mocks.currentSearchParams = new URLSearchParams("page=3");

    renderWithQueryClient(<ManagedPropertiesPage />);

    await screen.findByRole("heading", { name: "My Properties" });
    await user.click(screen.getByRole("tab", { name: "Pending" }));

    expect(mocks.push).toHaveBeenCalledWith("/dashboard/properties?status=pending_review");
  });

  it("renders empty state separately from API failure", async () => {
    mocks.listManagedProperties.mockResolvedValueOnce(paginated([]));

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(
      await screen.findByText("You haven't added or been assigned any properties yet."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add your first property" })).toHaveAttribute(
      "href",
      "/properties/new",
    );
  });

  it("renders a retryable error state", async () => {
    mocks.listManagedProperties.mockRejectedValueOnce(new Error("Nope"));

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(
      await screen.findByText("Properties could not be loaded. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("blocks non-supply users from the management UI", () => {
    mocks.currentUser = {
      id: "buyer-1",
      first_name: "Ify",
      roles: [{ role: { name: "buyer" }, status: "approved" }],
    };

    renderWithQueryClient(<ManagedPropertiesPage />);

    expect(
      screen.getByText("This workspace is available to approved agents and landlords."),
    ).toBeInTheDocument();
    expect(mocks.listManagedProperties).not.toHaveBeenCalled();
  });
});

