import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReviewForm } from "@/components/services/review-form";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createServiceReview: vi.fn(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    createServiceReview: (payload: unknown) => mocks.createServiceReview(payload),
  };
});

describe("ReviewForm", () => {
  it("submits a booking-linked review once a star rating is selected", async () => {
    const user = userEvent.setup();
    mocks.createServiceReview.mockResolvedValue({});

    renderWithQueryClient(<ReviewForm bookingId="booking-1" />);

    await user.click(screen.getByRole("button", { name: "5 stars" }));
    await user.type(screen.getByLabelText("Review title"), "Excellent service");
    await user.type(screen.getByLabelText("Review"), "The provider completed the job neatly.");
    await user.click(screen.getByRole("button", { name: "Submit review" }));

    await waitFor(() => {
      expect(mocks.createServiceReview).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_id: "booking-1",
          rating: 5,
          title: "Excellent service",
        }),
      );
    });
    expect(await screen.findByText("Your review has been submitted for moderation."))
      .toBeInTheDocument();
  });
});
