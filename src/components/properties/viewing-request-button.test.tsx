import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ViewingRequestButton } from "@/components/properties/viewing-request-button";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createViewing: vi.fn(),
}));

vi.mock("@/lib/api/viewings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/viewings")>("@/lib/api/viewings");
  return {
    ...actual,
    createViewing: (payload: unknown) => mocks.createViewing(payload),
  };
});

describe("ViewingRequestButton", () => {
  it("opens the viewing modal and submits scheduling preferences", async () => {
    const user = userEvent.setup();
    mocks.createViewing.mockResolvedValueOnce({
      id: "viewing-1",
      status: "requested",
    });

    renderWithQueryClient(<ViewingRequestButton inquiryId="inquiry-1" />);

    await user.click(screen.getByRole("button", { name: "Request viewing" }));
    expect(screen.getByRole("dialog", { name: "Request viewing" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Viewing type"), "virtual");
    await user.clear(screen.getByLabelText("Preferred date"));
    await user.type(screen.getByLabelText("Preferred date"), "2026-08-20");
    await user.clear(screen.getByLabelText("Preferred time"));
    await user.type(screen.getByLabelText("Preferred time"), "14:30");
    await user.type(screen.getByLabelText("Notes"), "I prefer a virtual tour first.");
    await user.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() =>
      expect(mocks.createViewing).toHaveBeenCalledWith({
        inquiry_id: "inquiry-1",
        viewing_type: "virtual",
        preferred_date: "2026-08-20",
        preferred_time: "14:30",
        notes: "I prefer a virtual tour first.",
      }),
    );
  });
});
