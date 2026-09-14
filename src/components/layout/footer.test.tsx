import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders the Reality footer by default with current navigation targets", () => {
    render(<Footer />);

    expect(screen.getByText(/Where Dreams Find an Address/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy property" })).toHaveAttribute(
      "href",
      "/properties?listing_type=sale",
    );
    expect(screen.getByRole("img", { name: "Modern city skyline with green residential spaces" })).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });
});

