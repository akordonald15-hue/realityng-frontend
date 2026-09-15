import { screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import EditPropertyPage from "@/app/(dashboard)/dashboard/properties/[propertyId]/edit/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  segment: "qa-owned-draft",
  getProperty: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ propertyId: mocks.segment }),
}));
vi.mock("@/lib/api/properties", () => ({
  getProperty: (slug: string) => mocks.getProperty(slug),
}));
vi.mock("@/components/properties/property-form", () => ({
  PropertyForm: ({ initialProperty }: { initialProperty: { slug: string } }) => (
    <div>Editing {initialProperty.slug}</div>
  ),
}));

beforeEach(() => {
  mocks.segment = "qa-owned-draft";
  mocks.getProperty.mockReset();
  mocks.getProperty.mockResolvedValue({ id: "uuid-owned-1", slug: "qa-owned-draft" });
});

it("retrieves and hydrates a managed property by its slug", async () => {
  renderWithQueryClient(<EditPropertyPage />);

  expect(await screen.findByText("Editing qa-owned-draft")).toBeInTheDocument();
  await waitFor(() => expect(mocks.getProperty).toHaveBeenCalledWith("qa-owned-draft"));
  expect(mocks.getProperty).not.toHaveBeenCalledWith("uuid-owned-1");
});

it("decodes a slug route segment before management detail retrieval", async () => {
  mocks.segment = "qa%2Downed-draft";
  renderWithQueryClient(<EditPropertyPage />);

  expect(await screen.findByText("Editing qa-owned-draft")).toBeInTheDocument();
  expect(mocks.getProperty).toHaveBeenCalledWith("qa-owned-draft");
});
