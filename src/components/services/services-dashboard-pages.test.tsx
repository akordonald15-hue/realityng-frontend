import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminServicesDashboardPage from "@/app/(admin)/admin/services/page";
import ArtisanDashboardPage from "@/app/(dashboard)/dashboard/artisan/page";
import CustomerServicesDashboardPage from "@/app/(dashboard)/dashboard/services/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getAdminServicesDashboard: vi.fn(),
  getCustomerServicesDashboard: vi.fn(),
  getProviderServicesDashboard: vi.fn(),
  createProviderProfile: vi.fn(),
  submitProviderProfile: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    getAdminServicesDashboard: () => mocks.getAdminServicesDashboard(),
    getCustomerServicesDashboard: () => mocks.getCustomerServicesDashboard(),
    getProviderServicesDashboard: () => mocks.getProviderServicesDashboard(),
    createProviderProfile: (payload: unknown) => mocks.createProviderProfile(payload),
    submitProviderProfile: () => mocks.submitProviderProfile(),
  };
});

const provider = {
  id: "provider-1",
  slug: "bright-spark",
  status: "active",
  provider_type: "individual",
  business_name: "Bright Spark Electrical",
  headline: "Electrical repairs across Lagos",
  biography: "Residential wiring and inverter repairs.",
  country: "Nigeria",
  state: "Lagos",
  city: "Lagos",
  display_location: "Lekki, Lagos",
  verification_badges: [],
  average_rating: "4.80",
  completed_jobs_count: 12,
  published_review_count: 6,
  recommendation_percentage: 92,
  trades: [],
  primary_trade: null,
  service_areas: [],
  portfolio_count: 2,
  completion: { is_complete: true, missing_fields: [], warnings: [] },
  created_at: "2026-08-01T09:00:00Z",
};

const quote = {
  id: "quote-1",
  customer: "customer-1",
  customer_name: "Ada Buyer",
  provider,
  service_category: null,
  project_title: "Repair inverter wiring",
  project_description: "The inverter trips.",
  budget_range: "NGN 100,000 - 250,000",
  preferred_contact_method: "whatsapp",
  phone: "+2348000000000",
  email: "ada@example.com",
  property_address: "Lekki",
  state: "Lagos",
  lga: "Eti-Osa",
  preferred_start_date: null,
  status: "submitted",
  viewed_at: null,
  responded_at: null,
  closed_at: null,
  created_at: "2026-08-01T09:00:00Z",
  updated_at: "2026-08-01T09:00:00Z",
};

const review = {
  id: "review-1",
  reviewer_label: "A. Verified customer",
  provider,
  booking: {
    id: "booking-1",
    provider,
    title: "Inverter wiring repair",
    service_summary: "Completed repair.",
    status: "completed",
    service_category: null,
    completed_at: "2026-08-02T09:00:00Z",
    created_at: "2026-08-01T09:00:00Z",
  },
  rating: 5,
  title: "Clean electrical repair",
  comment: "The provider fixed the wiring neatly.",
  would_recommend: true,
  status: "published",
  can_edit: false,
  provider_response: "",
  provider_responded_at: null,
  published_at: "2026-08-03T09:00:00Z",
  created_at: "2026-08-02T09:00:00Z",
};

function stats() {
  return [
    { label: "Quote requests", value: "1", detail: "Requests sent" },
    { label: "Average rating", value: "4.80", detail: "Published reviews" },
  ];
}

describe("services operational dashboards", () => {
  it("renders the customer services dashboard summary", async () => {
    mocks.getCustomerServicesDashboard.mockResolvedValueOnce({
      stats: stats(),
      recent_quote_requests: [quote],
      submitted_reviews: [review],
      eligible_reviews: [review.booking],
      recent_providers: [provider],
      recommended_providers: [provider],
      service_categories: [],
      activity: [
        {
          id: "activity-1",
          title: "Quote requested: Repair inverter wiring",
          description: "Bright Spark Electrical",
          status: "submitted",
          timestamp: "2026-08-01T09:00:00Z",
          href: "/dashboard/services",
        },
      ],
    });

    renderWithQueryClient(<CustomerServicesDashboardPage />);

    expect(await screen.findByText("Your service requests and trusted providers")).toBeInTheDocument();
    expect(await screen.findByText("Recent quote requests")).toBeInTheDocument();
    expect(screen.getByText("Eligible reviews waiting")).toBeInTheDocument();
    expect(screen.getAllByText("Bright Spark Electrical").length).toBeGreaterThan(0);
  });

  it("renders the provider operations dashboard", async () => {
    mocks.getProviderServicesDashboard.mockResolvedValueOnce({
      profile: provider,
      stats: stats(),
      quote_status_counts: { submitted: 1, viewed: 0, responded: 0, closed: 0, cancelled: 0 },
      review_status_counts: {
        pending: 0,
        published: 1,
        flagged: 0,
        hidden: 0,
        disputed: 0,
        removed: 0,
      },
      recent_quote_requests: [quote],
      latest_reviews: [review],
      response_reminders: [review],
      activity: [],
    });

    renderWithQueryClient(<ArtisanDashboardPage />);

    expect(await screen.findByText("Provider operations command centre")).toBeInTheDocument();
    expect(await screen.findByText("Profile completeness")).toBeInTheDocument();
    expect(screen.getByText("Latest quote requests")).toBeInTheDocument();
    expect(screen.getByText("Response reminders")).toBeInTheDocument();
  });

  it("renders the admin services operations dashboard", async () => {
    mocks.getAdminServicesDashboard.mockResolvedValueOnce({
      stats: stats(),
      provider_status_counts: {
        draft: 0,
        pending_review: 1,
        active: 1,
        needs_more_information: 0,
        rejected: 0,
        suspended: 0,
        inactive: 0,
        archived: 0,
      },
      quote_status_counts: { submitted: 1, viewed: 0, responded: 0, closed: 0, cancelled: 0 },
      review_status_counts: {
        pending: 1,
        published: 0,
        flagged: 0,
        hidden: 0,
        disputed: 0,
        removed: 0,
      },
      pending_providers: [provider],
      pending_reviews: [review],
      flagged_reviews: [],
      open_quote_requests: [quote],
      category_breakdown: [{ label: "Electrical", value: 1 }],
      geographic_breakdown: [{ label: "Lagos", value: 1 }],
      activity: [],
    });

    renderWithQueryClient(<AdminServicesDashboardPage />);

    expect(await screen.findByText("Provider marketplace control room")).toBeInTheDocument();
    expect(await screen.findByText("Pending provider approvals")).toBeInTheDocument();
    expect(screen.getByText("Open quote requests")).toBeInTheDocument();
    expect(screen.getByText("Service category counts")).toBeInTheDocument();
  });
});
