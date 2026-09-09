import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandLogo } from "@/components/brand/brand-logo";

describe("BrandLogo", () => {
  it("uses the black logo by default for light backgrounds", () => {
    render(<BrandLogo className="h-16 w-auto" />);

    expect(screen.getByRole("img", { name: "RealityNG" })).toHaveAttribute(
      "src",
      expect.stringContaining("realityng-logo-black.svg"),
    );
  });

  it("can use the white logo on dark backgrounds", () => {
    render(<BrandLogo className="h-16 w-auto" tone="light" />);

    expect(screen.getByRole("img", { name: "RealityNG" })).toHaveAttribute(
      "src",
      expect.stringContaining("realityng-logo-white.svg"),
    );
  });

  it("uses the dedicated icon asset for compact icon placements", () => {
    render(<BrandLogo className="h-7 w-7" variant="icon" />);

    expect(screen.getByRole("img", { name: "RealityNG" })).toHaveAttribute(
      "src",
      expect.stringContaining("realityng-icon.svg"),
    );
  });

  it("places the tagline under the RealityNG wordmark area", () => {
    render(<BrandLogo className="h-16 w-auto" showTagline />);

    expect(screen.getByText("Where Dreams Find an Address")).toHaveClass("ml-[36%]");
    expect(screen.getByText("Where Dreams Find an Address")).toHaveClass("-mt-1");
    expect(screen.getByText("Where Dreams Find an Address")).toHaveClass("font-body");
  });
});
