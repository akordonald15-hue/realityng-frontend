import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandLogo } from "@/components/brand/brand-logo";

describe("BrandLogo", () => {
  it("places the tagline under the RealityNG wordmark area", () => {
    render(<BrandLogo className="h-16 w-auto" showTagline />);

    expect(screen.getByText("Where Dreams Find an Address")).toHaveClass("ml-[31%]");
    expect(screen.getByText("Where Dreams Find an Address")).toHaveClass("font-body");
  });
});
