import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ApplyPage from "@/app/apply/[propertyId]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createApplication: vi.fn(),
  getPublicProperty: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  protectedRoute: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ propertyId: "property-3" }),
  useSearchParams: () =>
    new URLSearchParams("slug=lekki-phase-one-serviced-apartment&inquiry=inquiry-1&viewing=viewing-1"),
  usePathname: () => "/apply/property-3",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => {
    mocks.protectedRoute();
    return <>{children}</>;
  },
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

function property(overrides = {}) {
  return {
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
    display_location: "Lekki Phase 1, Lagos",
    description: "Serviced apartment",
    bedrooms: 3,
    bathrooms: 4,
    floor_area: "210",
    cover_image_url: "https://images.example/property.jpg",
    featured: true,
    created_at: "2026-06-03T10:00:00Z",
    ...overrides,
  };
}

async function renderLoadedPage(overrides = {}) {
  mocks.getPublicProperty.mockResolvedValueOnce(property(overrides));
  renderWithQueryClient(<ApplyPage />);
  await waitFor(() => expect(screen.getAllByText("₦18,000,000").length).toBeGreaterThan(0));
}

async function fillRequiredForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Employer name *"), "Diaspora Tech Holdings");
  await user.selectOptions(screen.getByLabelText("Monthly Income *"), "900000");
  await user.type(screen.getByLabelText("Message *"), "I can move in after review.");
}

describe("ApplyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads application data and renders the real property summary", async () => {
    await renderLoadedPage();

    expect(mocks.protectedRoute).toHaveBeenCalled();
    expect(mocks.getPublicProperty).toHaveBeenCalledWith("lekki-phase-one-serviced-apartment");
    expect(screen.getByRole("heading", { name: "Submit your application" })).toBeInTheDocument();
    expect(screen.getAllByText("Lekki Phase 1, Lagos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Apartment Share").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Full name *")).toHaveValue("Ify Madu");
    expect(screen.getByLabelText("Email *")).toHaveValue("buyer@realityng.com");
    expect(screen.getByLabelText("Phone *")).toHaveValue("+1 832 555 0144");
  });

  it("validates required fields before submitting", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();

    await user.clear(screen.getByLabelText("Full name *"));
    await user.clear(screen.getByLabelText("Email *"));
    await user.clear(screen.getByLabelText("Phone *"));
    await user.click(screen.getByRole("button", { name: "Submit application" }));

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your phone number.")).toBeInTheDocument();
    expect(screen.getByText("Enter your employer name.")).toBeInTheDocument();
    expect(screen.getByText("Select your income range.")).toBeInTheDocument();
    expect(screen.getByText("Add a short message for the property owner.")).toBeInTheDocument();
    expect(mocks.createApplication).not.toHaveBeenCalled();
  });

  it("submits the existing application payload and shows the success state after the API succeeds", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();
    mocks.createApplication.mockResolvedValueOnce({
      id: "application-1",
      status: "submitted",
    });

    await fillRequiredForm(user);
    await user.click(screen.getByRole("button", { name: "Submit application" }));

    await waitFor(() =>
      expect(mocks.createApplication).toHaveBeenCalledWith({
        property_id: "property-3",
        inquiry_id: "inquiry-1",
        viewing_id: "viewing-1",
        full_name: "Ify Madu",
        email: "buyer@realityng.com",
        phone: "+1 832 555 0144",
        employment_status: "Full-time",
        employer_name: "Diaspora Tech Holdings",
        monthly_income: "900000",
        move_in_date: expect.any(String),
        message: "I can move in after review.",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Application submitted");
    expect(screen.getByText(/buyer@realityng.com/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "View property" })).toHaveAttribute(
      "href",
      "/properties/lekki-phase-one-serviced-apartment",
    );
  });

  it("disables the submit button while pending and only submits once", async () => {
    const user = userEvent.setup();
    let resolveApplication: (value: unknown) => void = () => undefined;
    mocks.createApplication.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveApplication = resolve;
        }),
    );
    await renderLoadedPage();
    await fillRequiredForm(user);

    const submitButton = screen.getByRole("button", { name: "Submit application" });
    await user.click(submitButton);

    expect(await screen.findByRole("button", { name: "Submitting application..." })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Submitting application..." }));
    expect(mocks.createApplication).toHaveBeenCalledTimes(1);
    resolveApplication({ id: "application-1", status: "submitted" });
    expect(await screen.findByRole("status")).toHaveTextContent("Application submitted");
  });

  it("surfaces backend validation errors", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();
    mocks.createApplication.mockRejectedValueOnce({
      response: { data: { detail: "You have already applied for this property." } },
      isAxiosError: true,
      toJSON: () => ({}),
    });

    await fillRequiredForm(user);
    await user.click(screen.getByRole("button", { name: "Submit application" }));

    expect(await screen.findByText("You have already applied for this property.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("surfaces general API failures without showing success", async () => {
    const user = userEvent.setup();
    await renderLoadedPage();
    mocks.createApplication.mockRejectedValueOnce(new Error("Network down"));

    await fillRequiredForm(user);
    await user.click(screen.getByRole("button", { name: "Submit application" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("handles invalid or not-found property context", async () => {
    mocks.getPublicProperty.mockRejectedValueOnce(new Error("Property not found."));
    renderWithQueryClient(<ApplyPage />);

    expect(await screen.findByText(/Property could not be loaded/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit application" })).toBeDisabled();
    expect(screen.getAllByText(/Property summary unavailable/).length).toBeGreaterThan(0);
  });

  it("keeps a mobile-compatible single-column form order", async () => {
    await renderLoadedPage();

    const form = screen.getByRole("button", { name: "Submit application" }).closest("form");
    expect(form).not.toBeNull();
    expect(within(form as HTMLFormElement).getByLabelText("Message *")).toBeInTheDocument();
    const labels = Array.from((form as HTMLFormElement).querySelectorAll("label"))
      .map((label) => label.querySelector("span")?.textContent?.replace(/\s+/g, " ").trim());

    expect(labels).toEqual([
      "Full name *",
      "Email *",
      "Phone *",
      "Employment status *",
      "Employer name *",
      "Monthly Income *",
      "Preferred move-in date *",
      "Message *",
    ]);
  });
});
