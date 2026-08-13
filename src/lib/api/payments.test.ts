import { describe, expect, it, vi } from "vitest";

import {
  createTransaction,
  listDisputes,
  listTransactions,
} from "@/lib/api/payments";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/demo-mode", () => ({
  USE_MOCKS: false,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: mocks.get,
    post: mocks.post,
  },
}));

describe("payment API client", () => {
  it("normalizes paginated transaction and dispute responses", async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: "transaction-1", property: "property-1" }],
      },
    });

    await expect(listTransactions()).resolves.toEqual([
      { id: "transaction-1", property: "property-1" },
    ]);
    expect(mocks.get).toHaveBeenCalledWith("/transactions/");

    mocks.get.mockResolvedValueOnce({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: "dispute-1", transaction: "transaction-1" }],
      },
    });

    await expect(listDisputes()).resolves.toEqual([
      { id: "dispute-1", transaction: "transaction-1" },
    ]);
    expect(mocks.get).toHaveBeenCalledWith("/payment-disputes/");
  });

  it("uses server-owned transaction create fields", async () => {
    mocks.post.mockResolvedValueOnce({
      data: {
        id: "transaction-1",
        property: "property-1",
        buyer: "buyer-1",
        owner: "owner-1",
      },
    });

    await createTransaction({
      property_id: "property-1",
      application_id: "application-1",
      currency: "NGN",
    });

    expect(mocks.post).toHaveBeenCalledWith("/transactions/", {
      property_id: "property-1",
      application_id: "application-1",
      currency: "NGN",
    });
  });
});
