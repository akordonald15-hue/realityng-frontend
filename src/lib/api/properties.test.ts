import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { getPublicProperty } from "@/lib/api/properties";

vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
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
});
