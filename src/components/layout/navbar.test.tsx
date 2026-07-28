import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Navbar } from "@/components/layout/navbar";

describe("Navbar", () => {
  it("shows task-based marketplace navigation on desktop", () => {
    render(<Navbar />);

    expect(screen.getAllByRole("link", { name: "RealityNG home" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Buy" })[0]).toHaveAttribute(
      "href",
      "/properties?listing_type=sale",
    );
    expect(screen.getAllByRole("link", { name: "Rent" })[0]).toHaveAttribute(
      "href",
      "/properties?listing_type=rent",
    );
    expect(screen.getAllByRole("link", { name: "Shortlets" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=shortlet",
    );
    expect(screen.getAllByRole("link", { name: "Land" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=land",
    );
    expect(screen.getAllByRole("link", { name: "Commercial" })[0]).toHaveAttribute(
      "href",
      "/properties?property_type=commercial",
    );
    expect(screen.getAllByText("Verification standards").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Safety").length).toBeGreaterThan(0);
  });

  it("opens the compact mobile navigation without showing the tagline there", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getAllByText("Where Dreams Find an Address")).toHaveLength(1);
  });
});
