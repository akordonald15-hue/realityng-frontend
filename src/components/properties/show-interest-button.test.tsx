import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ShowInterestButton } from "@/components/properties/show-interest-button";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createInquiry: vi.fn(),
  push: vi.fn(),
  isAuthenticated: true,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/providers/auth-provider", () => ({
  useOptionalAuth: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock("@/lib/api/inquiries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/inquiries")>("@/lib/api/inquiries");
  return {
    ...actual,
    createInquiry: (payload: unknown) => mocks.createInquiry(payload),
  };
});

describe("ShowInterestButton", () => {
  it("opens the inquiry modal and submits purpose, contact preference, and message", async () => {
    const user = userEvent.setup();
    mocks.isAuthenticated = true;
    mocks.createInquiry.mockResolvedValueOnce({
      id: "inq-1",
      status: "new",
    });

    renderWithQueryClient(
      <ShowInterestButton
        listingType="rent"
        propertyId="property-1"
        propertySlug="lekki-apartment"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show interest" }));
    expect(screen.getByRole("dialog", { name: "Show interest" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Preferred contact"), "email");
    await user.type(screen.getByLabelText("Message"), "Please contact me about this apartment.");
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    await waitFor(() =>
      expect(mocks.createInquiry).toHaveBeenCalledWith({
        property_id: "property-1",
        inquiry_type: "rent",
        contact_preference: "email",
        message: "Please contact me about this apartment.",
      }),
    );
    expect(
      await screen.findByText("Your interest has been saved for follow-up."),
    ).toBeInTheDocument();
  });

  it("redirects anonymous users to sign up", async () => {
    const user = userEvent.setup();
    mocks.isAuthenticated = false;

    renderWithQueryClient(
      <ShowInterestButton
        listingType="sale"
        propertyId="property-1"
        propertySlug="banana-island-duplex"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show interest" }));

    expect(mocks.push).toHaveBeenCalledWith(
      "/auth/sign-up?next=%2Fproperties%2Fbanana-island-duplex",
    );
  });
});
