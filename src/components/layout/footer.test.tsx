import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("keeps marketplace, account, and trust links discoverable", () => {
    render(<Footer />);

    expect(screen.getByText("Where Dreams Find an Address")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy property" })).toHaveAttribute(
      "href",
      "/properties?listing_type=sale",
    );
    expect(screen.getByRole("link", { name: "List a Property" })).toHaveAttribute(
      "href",
      "/properties/new",
    );
    expect(screen.getByRole("link", { name: "Verification standards" })).toHaveAttribute(
      "href",
      "/verification-standards",
    );
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
