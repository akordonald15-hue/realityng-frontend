import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/(dashboard)/dashboard/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  currentUser: {
    id: "buyer-1",
    first_name: "Ify",
    roles: [{ role: { name: "buyer" }, status: "approved" }],
  },
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: mocks.currentUser,
  }),
  useOptionalAuth: () => ({
    user: mocks.currentUser,
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api/dashboard", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/dashboard")>("@/lib/api/dashboard");
  return {
    ...actual,
    getDashboardOverview: (user: unknown) => mocks.getDashboardOverview(user),
  };
});

function property(overrides = {}) {
  return {
    id: "property-1",
    title: "Waterfront Banana Island Duplex",
    slug: "waterfront-banana-island-duplex",
    listing_type: "sale",
    property_type: "duplex",
    price: "1850000000",
    currency: "NGN",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    address: "Banana Island",
    description: "Waterfront home",
    bedrooms: 5,
    bathrooms: 6,
    floor_area: "820",
    cover_image_url: "https://images.example/property.jpg",
    featured: true,
    created_at: "2026-06-03T10:00:00Z",
    ...overrides,
  };
}

function application(overrides = {}) {
  return {
    id: "application-1",
    property: {
      id: "property-1",
      title: "Waterfront Banana Island Duplex",
      slug: "waterfront-banana-island-duplex",
      listing_type: "sale",
      property_type: "duplex",
      price: "1850000000",
      currency: "NGN",
      city: "Lagos",
      state: "Lagos",
      cover_image_url: "https://images.example/property.jpg",
    },
    applicant: { id: "buyer-1", email: "buyer@realityng.com", full_name: "Ify Madu" },
    property_owner: { id: "agent-1", email: "agent@realityng.com", full_name: "Agent One" },
    inquiry: null,
    viewing: null,
    full_name: "Ify Madu",
    email: "buyer@realityng.com",
    phone: "+234 800 000 0000",
    employment_status: "Full-time",
    employer_name: "Reality",
    monthly_income: "900000",
    move_in_date: "2026-07-10",
    message: "Ready to proceed.",
    status: "approved",
    owner_notes: "",
    created_at: "2026-06-03T10:00:00Z",
    updated_at: "2026-06-03T10:00:00Z",
    ...overrides,
  };
}

function inquiry(overrides = {}) {
  return {
    id: "inquiry-1",
    property: application().property,
    interested_user: { id: "buyer-1", email: "buyer@realityng.com", full_name: "Ify Madu" },
    property_owner: { id: "agent-1", email: "agent@realityng.com", full_name: "Agent One" },
    purpose: "buy",
    contact_preference: "email",
    message: "Can I see more details?",
    status: "new",
    owner_notes: "",
    created_at: "2026-06-02T10:00:00Z",
    updated_at: "2026-06-02T10:00:00Z",
    ...overrides,
  };
}

function viewing(overrides = {}) {
  return {
    id: "viewing-1",
    property: application().property,
    requester: { id: "buyer-1", email: "buyer@realityng.com", full_name: "Ify Madu" },
    property_owner: { id: "agent-1", email: "agent@realityng.com", full_name: "Agent One" },
    inquiry: "inquiry-1",
    viewing_type: "physical",
    preferred_date: "2026-07-05",
    preferred_time: "10:00:00",
    confirmed_datetime: null,
    meeting_location: "",
    meeting_link: "",
    notes: "",
    status: "requested",
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:00:00Z",
    ...overrides,
  };
}

function overview(overrides = {}) {
  return {
    role: "buyer",
    metrics: [
      { label: "Saved properties", value: "2", detail: "Shortlisted homes" },
      { label: "Active listings", value: "0", detail: "Buyer accounts do not list properties" },
      { label: "My applications", value: "4", detail: "Submitted applications" },
      { label: "My inquiries", value: "3", detail: "Agent conversations" },
    ],
    savedProperties: [property()],
    recentlyViewed: [property({ id: "property-2", title: "Maitama Diplomatic Residence" })],
    recommendedProperties: [property({ id: "property-3", title: "Lekki Serviced Apartment" })],
    inquiries: [inquiry()],
    viewings: [viewing()],
    applications: [application()],
    activeListings: [],
    leads: [],
    receivedViewings: [],
    receivedApplications: [],
    transactions: [],
    activity: [
      {
        id: "activity-1",
        label: "Application submitted",
        entity_type: "application",
        occurred_at: "2026-06-03T10:00:00Z",
      },
    ],
    pendingApprovals: [],
    userStats: [],
    ...overrides,
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentUser = {
      id: "buyer-1",
      first_name: "Ify",
      roles: [{ role: { name: "buyer" }, status: "approved" }],
    };
  });

  it("renders the Figma-aligned buyer dashboard with real user and metrics", async () => {
    mocks.getDashboardOverview.mockResolvedValueOnce(overview());

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByRole("heading", { name: "Hi, Ify" })).toBeInTheDocument();
    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Buyer dashboard sections" })).toBeInTheDocument();
    expect(screen.getByText("Your dashboard Summary")).toBeInTheDocument();
    expect(screen.getByText("My application")).toBeInTheDocument();
    expect(screen.getByText("Saved property")).toBeInTheDocument();
    expect(screen.getByText("Inquiries")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("4").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Waterfront Banana Island Duplex").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Explore properties" })).toHaveAttribute(
      "href",
      "/properties",
    );
    expect(mocks.getDashboardOverview).toHaveBeenCalledWith(mocks.currentUser);
  });

  it("handles zero metrics and empty buyer dashboard states", async () => {
    mocks.getDashboardOverview.mockResolvedValueOnce(
      overview({
        metrics: [
          { label: "Saved properties", value: "0", detail: "None yet" },
          { label: "Active listings", value: "0", detail: "None yet" },
          { label: "My applications", value: "0", detail: "None yet" },
          { label: "My inquiries", value: "0", detail: "None yet" },
        ],
        savedProperties: [],
        recentlyViewed: [],
        recommendedProperties: [],
        inquiries: [],
        viewings: [],
        applications: [],
        activity: [],
      }),
    );

    renderWithQueryClient(<DashboardPage />);

    expect(
      await screen.findByText(
        "Saved properties will appear here after you shortlist homes from the marketplace.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Applications and requests will appear here after you show interest, request a viewing, or submit an application.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recently viewed properties will appear as you browse the marketplace."),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(4));
  });

  it("renders application, request, and status variants from dashboard data", async () => {
    mocks.getDashboardOverview.mockResolvedValueOnce(
      overview({
        applications: [
          application({ status: "approved" }),
          application({ id: "application-2", status: "submitted" }),
        ],
        inquiries: [inquiry({ status: "closed" })],
        viewings: [viewing({ status: "confirmed" })],
      }),
    );

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /View details/i })[0]).toHaveAttribute(
      "href",
      "/dashboard/applications/application-1",
    );
  });

  it("supports buyer dashboard tabs without changing routes", async () => {
    const user = userEvent.setup();
    mocks.getDashboardOverview.mockResolvedValueOnce(overview());

    renderWithQueryClient(<DashboardPage />);
    await screen.findByRole("heading", { name: "Hi, Ify" });
    await user.click(screen.getByRole("tab", { name: "Saved" }));

    expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Saved Property")).toBeInTheDocument();
    expect(screen.queryByText("Recently viewed property")).not.toBeInTheDocument();
  });

  it("surfaces dashboard API failure in the buyer design", async () => {
    mocks.getDashboardOverview.mockRejectedValueOnce(new Error("Dashboard unavailable"));

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Dashboard stats could not be loaded.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hi, Ify" })).toBeInTheDocument();
  });

  it("does not replace non-buyer dashboard behavior", async () => {
    mocks.currentUser = {
      id: "agent-1",
      first_name: "Tunde",
      roles: [{ role: { name: "agent" }, status: "approved" }],
    };
    mocks.getDashboardOverview.mockResolvedValueOnce(
      overview({
        role: "agent",
        metrics: [{ label: "Active listings", value: "5", detail: "Live marketplace inventory" }],
        activeListings: [property()],
      }),
    );

    renderWithQueryClient(<DashboardPage />);

    expect(await screen.findByText("Owner and agent workspace")).toBeInTheDocument();
    expect(screen.getByText("Pipeline visibility")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hi, Tunde" })).not.toBeInTheDocument();
  });
});
