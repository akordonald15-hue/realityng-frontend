import { describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import {
  acceptFinancingOffer,
  createFinancingApplication,
  listFinancingProducts,
  submitFinancingToPartner,
} from "@/lib/api/financing";

vi.mock("@/lib/demo-mode", () => ({ USE_MOCKS: false }));
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("financing API", () => {
  it("lists products through the financing products endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { results: [] } });

    await listFinancingProducts();

    expect(apiClient.get).toHaveBeenCalledWith("/financing-products/");
  });

  it("creates financing applications without frontend-owned status fields", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: "app-1" } });

    await createFinancingApplication({
      product_id: "product-1",
      requested_amount: "1200000.00",
      purpose: "Rent finance",
      preferred_tenor_months: 6,
      employment_status: "employed",
      monthly_income_band: "NGN 1m - 2m",
      state: "Lagos",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/financing-applications/",
      expect.not.objectContaining({ status: expect.anything(), partner_status: expect.anything() }),
    );
  });

  it("uses backend endpoints for partner submission and offer acceptance", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await submitFinancingToPartner({
      applicationId: "app-1",
      submissionReference: "partner-sub-1",
    });
    await acceptFinancingOffer("offer-1");

    expect(apiClient.post).toHaveBeenCalledWith(
      "/admin-financing-applications/app-1/submit-to-partner/",
      { submission_reference: "partner-sub-1" },
    );
    expect(apiClient.post).toHaveBeenCalledWith("/financing-offers/offer-1/accept/");
  });
});
