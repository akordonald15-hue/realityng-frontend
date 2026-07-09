import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ApplyPage from "@/app/apply/[propertyId]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createApplication: vi.fn(),
  getPublicProperty: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ propertyId: "property-3" }),
  useSearchParams: () => new URLSearchParams("slug=lekki-phase-one-serviced-apartment"),
  usePathname: () => "/apply/property-3",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/layout/navbar", () => ({
  Navbar: () => <nav>Navbar</nav>,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <footer>Footer</footer>,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: {
      id: "buyer-1",
      email: "buyer@realityng.com",
      phone_number: "+1 832 555 0144",
      first_name: "Ify",
      last_name: "Madu",
      full_name: "Ify Madu",
    },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api/applications", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/applications")>("@/lib/api/applications");
  return {
    ...actual,
    createApplication: (payload: unknown) => mocks.createApplication(payload),
  };
});

vi.mock("@/lib/api/properties", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/properties")>("@/lib/api/properties");
  return {
    ...actual,
    getPublicProperty: (slug: string) => mocks.getPublicProperty(slug),
  };
});

describe("ApplyPage", () => {
  it("submits a rental application for a property", async () => {
    const user = userEvent.setup();
    mocks.getPublicProperty.mockResolvedValueOnce({
      id: "property-3",
      title: "Lekki Phase 1 Serviced Apartment",
      slug: "lekki-phase-one-serviced-apartment",
      listing_type: "apartment_share",
      property_type: "apartment",
      price: "18000000",
      currency: "NGN",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      address: "Off Admiralty Way",
      description: "Serviced apartment",
      featured: true,
      created_at: "2026-06-03T10:00:00Z",
    });
    mocks.createApplication.mockResolvedValueOnce({
      id: "application-1",
      status: "submitted",
    });

    renderWithQueryClient(<ApplyPage />);

    expect(await screen.findByText("Lekki Phase 1 Serviced Apartment")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Employer name"), "Diaspora Tech Holdings");
    await user.type(screen.getByLabelText("Monthly income"), "950000");
    await user.type(screen.getByLabelText("Message"), "I can move in after review.");
    await user.click(screen.getByRole("button", { name: "Submit application" }));

    await waitFor(() =>
      expect(mocks.createApplication).toHaveBeenCalledWith({
        property_id: "property-3",
        inquiry_id: null,
        viewing_id: null,
        full_name: "Ify Madu",
        email: "buyer@realityng.com",
        phone: "+1 832 555 0144",
        employment_status: "Employed",
        employer_name: "Diaspora Tech Holdings",
        monthly_income: "950000",
        move_in_date: expect.any(String),
        message: "I can move in after review.",
      }),
    );
    expect(await screen.findByText("Application submitted.")).toBeInTheDocument();
  }, 15000);
});
