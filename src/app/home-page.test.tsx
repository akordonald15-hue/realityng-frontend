import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getPublicProperties: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "approved-lekki-apartment" }),
  usePathname: () => "/",
  useRouter: () => ({
    push: mocks.push,
    replace: vi.fn(),
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

describe("HomePage", () => {
  beforeEach(() => {
    mocks.push.mockReset();
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
          address: "Lekki Phase 1",
          bedrooms: 3,
          bathrooms: 3,
          parking_spaces: 2,
          land_size: null,
          floor_area: "180.00",
          featured: true,
          created_at: "2026-06-18T00:00:00Z",
        },
      ],
    });
  });

  it("renders search-first discovery sections and approved listings", async () => {
    renderWithQueryClient(<HomePage />);

    expect(screen.getByRole("heading", { name: "Find property in Nigeria with confidence." }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Property listing type")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lagos/i })).toHaveAttribute(
      "href",
      "/properties?city=Lagos",
    );
    expect(
      screen.getByRole("heading", { name: "Everything you need to make property easier" }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("Approved Lekki Apartment")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Featured properties" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Newly added properties" })).toBeInTheDocument();
    expect(screen.queryByText("Timothy Exodus")).not.toBeInTheDocument();
    expect(document.querySelector("#realityng-organization-jsonld")).toBeInTheDocument();
    expect(document.querySelector("#realityng-website-jsonld")).toBeInTheDocument();
  });

  it("builds a supported property-search URL from the hero form", async () => {
    renderWithQueryClient(<HomePage />);

    fireEvent.click(screen.getByRole("tab", { name: "For Rent" }));
    fireEvent.change(screen.getByLabelText("Search location"), {
      target: { value: "Lagos" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search properties" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    const [url] = mocks.push.mock.calls[0] as [string];
    expect(url).toContain("/properties?");
    expect(url).toContain("city=Lagos");
    expect(url).toContain("listing_type=rent");
  });

  it("switches to sale search and preserves property detail URLs", async () => {
    renderWithQueryClient(<HomePage />);

    fireEvent.click(screen.getByRole("tab", { name: "For Sale" }));
    fireEvent.click(screen.getByRole("button", { name: "Search properties" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/properties?listing_type=sale"));
    const propertyLinks = await screen.findAllByRole("link", {
      name: /View Approved Lekki Apartment/i,
    });
    expect(propertyLinks[0]).toHaveAttribute("href", "/properties/approved-lekki-apartment");
  });

  it("renders the mobile navigation trigger from the reality shell", () => {
    renderWithQueryClient(<HomePage />);

    expect(screen.getByRole("button", { name: "Toggle navigation" })).toBeInTheDocument();
  });
});
