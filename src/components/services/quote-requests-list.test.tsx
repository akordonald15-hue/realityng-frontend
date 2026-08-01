import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuoteRequestsList } from "@/components/services/quote-requests-list";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  markQuoteRequestViewed: vi.fn(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    markQuoteRequestViewed: (id: string) => mocks.markQuoteRequestViewed(id),
  };
});

describe("QuoteRequestsList", () => {
  it("renders quote request details and allows provider status action", async () => {
    const user = userEvent.setup();
    mocks.markQuoteRequestViewed.mockResolvedValue({});

    renderWithQueryClient(
      <QuoteRequestsList
        requests={[
          {
            id: "quote-1",
            customer: null,
            customer_name: "Ada Okoro",
            provider: {
              id: "provider-1",
              business_name: "Bright Spark Electrical",
              display_location: "Lekki, Lagos",
              provider_type: "individual",
              slug: "bright-spark-electrical",
            },
            service_category: {
              id: "cat-1",
              name: "Electrical",
              slug: "electrical",
              parent: null,
              description: "Electrical repairs.",
              icon: "zap",
              display_order: 10,
              requires_certification: true,
              is_active: true,
              children: [],
            },
            project_title: "Fix inverter wiring",
            project_description: "The inverter trips when the generator comes on.",
            budget_range: "NGN 100,000 - 250,000",
            preferred_contact_method: "whatsapp",
            phone: "08012345678",
            email: "ada@example.com",
            property_address: "Lekki Phase 1",
            state: "Lagos",
            lga: "Eti-Osa",
            preferred_start_date: "2026-08-20",
            status: "submitted",
            viewed_at: null,
            responded_at: null,
            closed_at: null,
            created_at: "2026-08-01T08:00:00Z",
            updated_at: "2026-08-01T08:00:00Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Fix inverter wiring" })).toBeInTheDocument();
    expect(screen.getByText("Ada Okoro")).toBeInTheDocument();
    expect(screen.getByText("08012345678")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark viewed" }));

    await waitFor(() => {
      expect(mocks.markQuoteRequestViewed).toHaveBeenCalledWith("quote-1");
    });
  });
});
