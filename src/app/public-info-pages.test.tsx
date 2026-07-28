import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutPage from "@/app/(public)/about/page";
import PrivacyPage from "@/app/(public)/privacy/page";
import VerificationStandardsPage from "@/app/(public)/verification-standards/page";

describe("public information pages", () => {
  it("renders the about page with public marketplace positioning", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        name: "A trust-first Nigerian property marketplace for local and diaspora decisions.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Explore approved properties")).toBeInTheDocument();
  });

  it("renders verification standards without overclaiming guarantees", () => {
    render(<VerificationStandardsPage />);

    expect(screen.getByRole("heading", { name: /How RealityNG treats verification/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/Verification is a trust layer, not a guarantee/i))
      .toBeInTheDocument();
  });

  it("renders privacy guidance for private verification evidence", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: /How RealityNG thinks about personal data/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/Keep private verification evidence separate/i)).toBeInTheDocument();
  });
});
