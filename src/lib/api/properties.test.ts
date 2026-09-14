import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import {
  getProperty,
  getPublicProperty,
  listManagedProperties,
  submitPropertyForReview,
  updateProperty,
} from "@/lib/api/properties";

vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

function axiosNotFound() {
  return {
    isAxiosError: true,
    response: { status: 404 },
  };
}

describe("properties API", () => {
  it("returns a public property directly when the slug detail endpoint resolves", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { id: "property-1", slug: "lekki-home" },
    });

    await expect(getPublicProperty("lekki-home")).resolves.toMatchObject({
      id: "property-1",
      slug: "lekki-home",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/public/properties/lekki-home/");
  });

  it("falls back from slug URLs to backend ID detail when the public detail endpoint is ID-based", async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(axiosNotFound())
      .mockResolvedValueOnce({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: [{ id: "property-1", slug: "lekki-home" }],
        },
      })
      .mockResolvedValueOnce({
        data: { id: "property-1", slug: "lekki-home", title: "Lekki Home" },
      });

    await expect(getPublicProperty("lekki-home")).resolves.toMatchObject({
      id: "property-1",
      title: "Lekki Home",
    });

    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/public/properties/lekki-home/");
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/public/properties/", {
      params: { search: "lekki-home" },
    });
    expect(apiClient.get).toHaveBeenNthCalledWith(3, "/public/properties/property-1/");
  });

  it("keeps the not-found error when no listed property matches the slug", async () => {
    const notFound = axiosNotFound();
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(notFound)
      .mockResolvedValueOnce({
        data: { count: 0, next: null, previous: null, results: [] },
      });

    await expect(getPublicProperty("missing-home")).rejects.toBe(notFound);
  });

  it("lists authenticated managed properties through the dedicated supply endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: [{ id: "property-1" }] },
    });

    await expect(
      listManagedProperties({
        status: "approved",
        search: "Lekki",
        property_type: "house",
        listing_type: "sale",
        ordering: "-created_at",
        page: "2",
      }),
    ).resolves.toMatchObject({ count: 1 });

    expect(apiClient.get).toHaveBeenCalledWith("/properties/mine/", {
      params: {
        status: "approved",
        search: "Lekki",
        property_type: "house",
        listing_type: "sale",
        ordering: "-created_at",
        page: "2",
      },
    });
  });

  it("loads, updates, and submits authenticated property drafts through management endpoints", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { id: "property-1", slug: "draft-home", status: "draft" },
    });
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { id: "property-1", slug: "draft-home", title: "Updated home" },
    });
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: "property-1", slug: "draft-home", status: "pending_review" },
    });

    await expect(getProperty("draft-home")).resolves.toMatchObject({ status: "draft" });
    await expect(
      updateProperty("draft-home", {
        title: "Updated home",
        description: "A complete and useful property description.",
        property_type: "house",
        listing_type: "rent",
        price: "2500000",
        currency: "NGN",
        country: "Nigeria",
        state: "Lagos",
        city: "Lagos",
        address: "Admiralty Way",
        floor_area: "180",
      }),
    ).resolves.toMatchObject({ title: "Updated home" });
    await expect(submitPropertyForReview("draft-home")).resolves.toMatchObject({
      status: "pending_review",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/properties/draft-home/");
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/properties/draft-home/",
      expect.objectContaining({ title: "Updated home" }),
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      "/properties/draft-home/submit-for-review/",
      {},
    );
  });
});
