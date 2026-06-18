import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PropertyImageManager } from "@/components/properties/property-image-manager";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  listPropertyImages: vi.fn(),
  uploadPropertyImage: vi.fn(),
  updatePropertyImage: vi.fn(),
  setPropertyCoverImage: vi.fn(),
  deletePropertyImage: vi.fn(),
}));

vi.mock("@/lib/api/properties", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/properties")>(
    "@/lib/api/properties",
  );
  return {
    ...actual,
    listPropertyImages: (propertySlug: string) => mocks.listPropertyImages(propertySlug),
    uploadPropertyImage: (payload: Record<string, unknown>) => mocks.uploadPropertyImage(payload),
    updatePropertyImage: (payload: Record<string, unknown>) => mocks.updatePropertyImage(payload),
    setPropertyCoverImage: (payload: Record<string, unknown>) => mocks.setPropertyCoverImage(payload),
    deletePropertyImage: (payload: Record<string, unknown>) => mocks.deletePropertyImage(payload),
  };
});

describe("PropertyImageManager", () => {
  it("manages uploads and gallery actions", async () => {
    mocks.listPropertyImages.mockResolvedValue([
      {
        id: "image-1",
        image_url: "https://cdn.example.com/image-1.jpg",
        caption: "Front",
        display_order: 1,
        is_cover: true,
        created_at: "2026-06-18T09:00:00Z",
      },
      {
        id: "image-2",
        image_url: "https://cdn.example.com/image-2.jpg",
        caption: "Kitchen",
        display_order: 2,
        is_cover: false,
        created_at: "2026-06-18T09:01:00Z",
      },
    ]);
    mocks.uploadPropertyImage.mockResolvedValue({});
    mocks.updatePropertyImage.mockResolvedValue({});
    mocks.setPropertyCoverImage.mockResolvedValue({});
    mocks.deletePropertyImage.mockResolvedValue({});

    renderWithQueryClient(<PropertyImageManager propertySlug="modern-lekki-apartment" />);

    expect(await screen.findByDisplayValue("Front")).toBeInTheDocument();

    const file = new File(["image"], "property.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Image"), { target: { files: [file] } });
    fireEvent.change(screen.getAllByLabelText("Caption")[0], { target: { value: "Balcony" } });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() =>
      expect(mocks.uploadPropertyImage).toHaveBeenCalledWith(
        expect.objectContaining({
          propertySlug: "modern-lekki-apartment",
          file,
          caption: "Balcony",
        }),
      ),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Move up" })[1]);
    await waitFor(() =>
      expect(mocks.updatePropertyImage).toHaveBeenCalledWith(
        expect.objectContaining({ imageId: "image-2", displayOrder: 1 }),
      ),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Set cover" })[1]);
    await waitFor(() =>
      expect(mocks.setPropertyCoverImage).toHaveBeenCalledWith({
        propertySlug: "modern-lekki-apartment",
        imageId: "image-2",
      }),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await waitFor(() =>
      expect(mocks.deletePropertyImage).toHaveBeenCalledWith({
        propertySlug: "modern-lekki-apartment",
        imageId: "image-1",
      }),
    );
  });
});
