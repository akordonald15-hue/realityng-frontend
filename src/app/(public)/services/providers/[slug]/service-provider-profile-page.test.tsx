import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ServiceProviderProfilePage from "@/app/(public)/services/providers/[slug]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  createQuoteRequest: vi.fn(),
  getServiceProvider: vi.fn(),
  listServiceReviews: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "bright-spark-electrical" }),
  usePathname: () => "/services/providers/bright-spark-electrical",
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    createQuoteRequest: (slug: string, payload: unknown) =>
      mocks.createQuoteRequest(slug, payload),
    getServiceProvider: (slug: string) => mocks.getServiceProvider(slug),
    listServiceReviews: (slug: string) => mocks.listServiceReviews(slug),
  };
});

describe("ServiceProviderProfilePage", () => {
  beforeEach(() => {
    mocks.createQuoteRequest.mockResolvedValue({});
    mocks.listServiceReviews.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: "review-1",
          reviewer_label: "A. Verified customer",
          booking: {
            id: "booking-1",
            title: "Electrical repair",
            service_summary: "Completed service",
            status: "completed",
            service_category: null,
            completed_at: "2026-07-28T10:00:00Z",
            created_at: "2026-07-26T10:00:00Z",
          },
          rating: 5,
          title: "Clean, careful work",
          comment: "The provider explained the issue clearly.",
          would_recommend: true,
          quality_rating: 5,
          punctuality_rating: 5,
          communication_rating: 5,
          value_rating: 4,
          provider_response: "Thank you for trusting our team.",
          provider_responded_at: "2026-07-29T12:00:00Z",
          published_at: "2026-07-29T09:00:00Z",
          created_at: "2026-07-28T15:00:00Z",
        },
      ],
    });
    mocks.getServiceProvider.mockResolvedValue({
      id: "provider-1",
      slug: "bright-spark-electrical",
      provider_type: "individual",
      business_name: "Bright Spark Electrical",
      headline: "Verified electrical repairs across Lagos",
      biography: "Residential wiring and inverter setup.",
      country: "Nigeria",
      state: "Lagos",
      city: "Lagos",
      lga: "Eti-Osa",
      neighborhood: "Lekki",
      display_location: "Lekki, Lagos",
      verification_badges: [{ label: "Identity Verified", status: "approved" }],
      review_trust_signals: [{ label: "Highly Rated", status: "approved", value: "4.7" }],
      average_rating: "4.70",
      average_quality_rating: "4.80",
      average_punctuality_rating: "4.60",
      average_communication_rating: "4.70",
      average_value_rating: "4.60",
      published_review_count: 6,
      recommendation_percentage: 92,
      completed_jobs_count: 12,
      trades: [
        {
          id: "trade-1",
          category: {
            id: "cat-electrical",
            name: "Electrical",
            slug: "electrical",
            parent: "cat-repairs",
            description: "Electrical repairs.",
            icon: "zap",
            display_order: 10,
            requires_certification: true,
            is_active: true,
            children: [],
          },
          is_primary: true,
          years_experience: 8,
          skill_level: "expert",
        },
      ],
      primary_trade: null,
      service_areas: [
        {
          id: "area-1",
          country: "Nigeria",
          state: "Lagos",
          city: "Lagos",
          lga: "Eti-Osa",
          neighborhood: "Lekki",
          service_radius_km: 15,
        },
      ],
      portfolio: { items: [], message: "Portfolio images will appear after approval." },
      reviews_summary: {
        average_rating: "4.70",
        average_quality_rating: "4.80",
        average_punctuality_rating: "4.60",
        average_communication_rating: "4.70",
        average_value_rating: "4.60",
        completed_jobs_count: 12,
        review_count: 6,
        recommendation_percentage: 92,
        message: "Ratings are calculated from published reviews.",
      },
      created_at: "2026-07-31T08:00:00Z",
    });
  });

  it("renders provider profile and submits quote request details", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ServiceProviderProfilePage />);

    expect(await screen.findByRole("heading", { name: "Bright Spark Electrical" }))
      .toBeInTheDocument();
    expect(screen.getAllByText("Identity Verified").length).toBeGreaterThan(0);
    expect(await screen.findByText("Clean, careful work")).toBeInTheDocument();
    expect(screen.getByText("Provider response")).toBeInTheDocument();
    expect(screen.getByText("Portfolio images will appear after approval.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Request Quote" }));
    await user.type(screen.getByLabelText("Project title"), "Fix inverter wiring");
    await user.type(
      screen.getByLabelText("Project details"),
      "The inverter trips when the estate generator comes on.",
    );
    await user.type(screen.getByLabelText("Your name"), "Ada Okoro");
    await user.type(screen.getByLabelText("Phone"), "08012345678");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");

    await user.click(screen.getByRole("button", { name: "Send quote request" }));

    await waitFor(() => {
      expect(mocks.createQuoteRequest).toHaveBeenCalledWith(
        "bright-spark-electrical",
        expect.objectContaining({
          customer_name: "Ada Okoro",
          phone: "08012345678",
          project_title: "Fix inverter wiring",
        }),
      );
    });
    expect(await screen.findByText("Your request has been sent.")).toBeInTheDocument();
  }, 20000);
});
