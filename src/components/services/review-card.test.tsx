import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReviewCard } from "@/components/services/review-card";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  respondToServiceReview: vi.fn(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    respondToServiceReview: (id: string, response: string) =>
      mocks.respondToServiceReview(id, response),
  };
});

describe("ReviewCard", () => {
  it("allows a provider to respond once to a published review", async () => {
    const user = userEvent.setup();
    mocks.respondToServiceReview.mockResolvedValue({});

    renderWithQueryClient(
      <ReviewCard
        mode="provider"
        review={{
          id: "review-1",
          reviewer_label: "Verified customer",
          booking: {
            id: "booking-1",
            title: "Electrical repair",
            service_summary: "Completed service",
            status: "completed",
            service_category: null,
            completed_at: "2026-07-28T10:00:00Z",
            created_at: "2026-07-26T10:00:00Z",
          },
          rating: 5,
          title: "Great work",
          comment: "The provider was professional.",
          would_recommend: true,
          status: "published",
          provider_response: "",
          provider_responded_at: null,
          published_at: "2026-07-29T09:00:00Z",
          created_at: "2026-07-28T15:00:00Z",
        }}
      />,
    );

    await user.type(screen.getByPlaceholderText("Write one public response"), "Thank you.");
    await user.click(screen.getByRole("button", { name: "Respond" }));

    await waitFor(() => {
      expect(mocks.respondToServiceReview).toHaveBeenCalledWith("review-1", "Thank you.");
    });
  });
});
