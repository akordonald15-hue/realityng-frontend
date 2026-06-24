import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CompareButton } from "@/components/properties/compare-button";
import type { Property } from "@/lib/api/properties";
import { renderWithQueryClient } from "@/test/render";

function property(index: number): Property {
  return {
    id: `property-${index}`,
    title: `Property ${index}`,
    slug: `property-${index}`,
    description: "Approved property available for comparison.",
    property_type: "apartment",
    listing_type: "rent",
    price: String(index * 1_000_000),
    currency: "NGN",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos",
    address: "Lekki",
    featured: false,
    created_at: "2026-06-24T00:00:00Z",
  };
}

describe("CompareButton", () => {
  it("selects up to four properties and allows removal", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <div>
        {[1, 2, 3, 4, 5].map((index) => (
          <CompareButton key={index} property={property(index)} />
        ))}
      </div>,
    );

    const addButtons = screen.getAllByRole("button", { name: /Add to comparison/ });
    for (const button of addButtons.slice(0, 4)) {
      await user.click(button);
    }

    expect(screen.getAllByRole("button", { name: /Remove from comparison/ })).toHaveLength(4);
    expect(screen.getByRole("button", { name: /Add to comparison: Property 5/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Remove from comparison: Property 1/ }));
    expect(screen.getByRole("button", { name: /Add to comparison: Property 5/ })).toBeEnabled();
  });
});
