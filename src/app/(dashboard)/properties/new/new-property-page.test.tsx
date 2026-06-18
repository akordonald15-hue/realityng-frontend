import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import NewPropertyPage from "@/app/(dashboard)/properties/new/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createProperty: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/properties", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/properties")>(
    "@/lib/api/properties",
  );
  return {
    ...actual,
    createProperty: (payload: Record<string, unknown>) => mocks.createProperty(payload),
  };
});

describe("NewPropertyPage", () => {
  it("creates a draft listing from step one", async () => {
    mocks.createProperty.mockResolvedValue({
      id: "property-1",
      title: "Modern Lekki Apartment",
    });

    renderWithQueryClient(<NewPropertyPage />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Modern Lekki Apartment" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A clean three-bedroom apartment near key roads." },
    });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "2500000" } });
    fireEvent.change(screen.getByLabelText("State"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Admiralty Way" } });
    fireEvent.change(screen.getByLabelText("Floor area sqm"), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() =>
      expect(mocks.createProperty).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Modern Lekki Apartment",
          listing_type: "rent",
        }),
      ),
    );
    expect(await screen.findByText("Modern Lekki Apartment saved as a draft.")).toBeInTheDocument();
  });

  it("validates required size rules", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<NewPropertyPage />);

    await user.selectOptions(screen.getByLabelText("Property type"), "land");
    await user.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByText("Land listings require land size.")).toBeInTheDocument();
    expect(mocks.createProperty).not.toHaveBeenCalled();
  });
});
