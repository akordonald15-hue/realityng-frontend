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

    expect(screen.getByRole("heading", { name: "Find property you can trust in Nigeria." }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start with what you need." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lagos.*View listings/i })).toHaveAttribute(
      "href",
      "/properties?city=Lagos",
    );
    expect(
      screen.getByRole("heading", { name: "Verification should be visible, specific, and honest" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Approved Lekki Apartment")).toBeInTheDocument();
    expect(document.querySelector("#realityng-organization-jsonld")).toBeInTheDocument();
    expect(document.querySelector("#realityng-website-jsonld")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "RealityNG AI" })).toBeInTheDocument();
  });

  it("builds a supported property-search URL from the hero form", async () => {
    renderWithQueryClient(<HomePage />);

    fireEvent.click(screen.getByRole("tab", { name: "Rent" }));
    fireEvent.change(screen.getByLabelText("Search city or area"), {
      target: { value: "Lagos" },
    });
    fireEvent.change(screen.getByLabelText("Property type"), { target: { value: "apartment" } });
    fireEvent.change(screen.getByLabelText("Maximum price"), { target: { value: "3000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Search properties" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    const [url] = mocks.push.mock.calls[0] as [string];
    expect(url).toContain("/properties?");
    expect(url).toContain("city=Lagos");
    expect(url).toContain("listing_type=rent");
    expect(url).toContain("property_type=apartment");
    expect(url).toContain("max_price=3000000");
  });
});
