import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import NewPropertyPage from "@/app/(dashboard)/properties/new/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createProperty: vi.fn(),
  listPropertyImages: vi.fn(),
  uploadPropertyImage: vi.fn(),
  updatePropertyImage: vi.fn(),
  setPropertyCoverImage: vi.fn(),
  deletePropertyImage: vi.fn(),
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
    listPropertyImages: (propertySlug: string) => mocks.listPropertyImages(propertySlug),
    uploadPropertyImage: (payload: Record<string, unknown>) => mocks.uploadPropertyImage(payload),
    updatePropertyImage: (payload: Record<string, unknown>) => mocks.updatePropertyImage(payload),
    setPropertyCoverImage: (payload: Record<string, unknown>) => mocks.setPropertyCoverImage(payload),
    deletePropertyImage: (payload: Record<string, unknown>) => mocks.deletePropertyImage(payload),
  };
});

describe("NewPropertyPage", () => {
  it("creates a draft listing from step one", async () => {
    mocks.createProperty.mockResolvedValue({
      id: "property-1",
      slug: "modern-lekki-apartment",
      title: "Modern Lekki Apartment",
    });
    mocks.listPropertyImages.mockResolvedValue([]);

    renderWithQueryClient(<NewPropertyPage />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Modern Lekki Apartment" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A clean three-bedroom apartment near key roads." },
    });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "2500000" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to location" }));

    fireEvent.change(await screen.findByLabelText("State"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Admiralty Way" } });
    fireEvent.change(screen.getByLabelText("Floor area sqm"), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft and add media" }));

    await waitFor(() =>
      expect(mocks.createProperty).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Modern Lekki Apartment",
          listing_type: "rent",
        }),
      ),
    );
    expect(await screen.findByText("Modern Lekki Apartment saved as a draft.")).toBeInTheDocument();
    expect(await screen.findByText("No images uploaded yet.")).toBeInTheDocument();
  });

  it("validates required size rules", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<NewPropertyPage />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Dry Land in Ibeju Lekki" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A properly documented dry land parcel near access roads." },
    });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "6000000" } });
    await user.selectOptions(screen.getByLabelText("Property type"), "land");
    await user.click(screen.getByRole("button", { name: "Continue to location" }));
    fireEvent.change(await screen.findByLabelText("State"), { target: { value: "Lagos" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Ibeju Lekki" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Eleko Road" } });
    await user.click(screen.getByRole("button", { name: "Save draft and add media" }));

    expect(await screen.findByText("Land listings require land size.")).toBeInTheDocument();
    expect(mocks.createProperty).not.toHaveBeenCalled();
  });
});
