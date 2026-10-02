import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import {
  listPortfolioImages,
  listProviderTrades,
  listServiceAreas,
} from "@/lib/api/services";

vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("provider-owned list APIs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes paginated provider trade, service-area, and portfolio responses", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { count: 1, next: null, previous: null, results: [{ id: "trade-1" }] } })
      .mockResolvedValueOnce({ data: { count: 1, next: null, previous: null, results: [{ id: "area-1" }] } })
      .mockResolvedValueOnce({ data: { count: 1, next: null, previous: null, results: [{ id: "image-1" }] } });

    await expect(listProviderTrades()).resolves.toEqual([{ id: "trade-1" }]);
    await expect(listServiceAreas()).resolves.toEqual([{ id: "area-1" }]);
    await expect(listPortfolioImages()).resolves.toEqual([{ id: "image-1" }]);
  });

  it("keeps compatibility with unpaginated list responses", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [{ id: "trade-1" }] });

    await expect(listProviderTrades()).resolves.toEqual([{ id: "trade-1" }]);
  });
});
