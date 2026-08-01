import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PortfolioManager } from "@/components/services/portfolio-manager";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  listPortfolioImages: vi.fn(),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    listPortfolioImages: () => mocks.listPortfolioImages(),
  };
});

describe("PortfolioManager", () => {
  beforeEach(() => {
    mocks.listPortfolioImages.mockResolvedValue([]);
  });

  it("renders upload controls and empty state", async () => {
    renderWithQueryClient(<PortfolioManager />);

    expect(screen.getByRole("heading", { name: "Manage work samples" })).toBeInTheDocument();
    expect(await screen.findByText(/Add completed project photos/i)).toBeInTheDocument();
  });

  it("shows validation when uploading without a file", async () => {
    renderWithQueryClient(<PortfolioManager />);

    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));

    expect(await screen.findByText("Choose an image before uploading.")).toBeInTheDocument();
  });
});
