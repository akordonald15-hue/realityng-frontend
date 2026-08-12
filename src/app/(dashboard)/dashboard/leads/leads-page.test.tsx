import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LeadInboxPage from "@/app/(dashboard)/dashboard/leads/page";
import LeadDetailPage from "@/app/(dashboard)/dashboard/leads/[id]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getLeadDashboardSummary: vi.fn(),
  listLeads: vi.fn(),
  getLead: vi.fn(),
  listLeadActivities: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "lead-1" }),
}));

vi.mock("@/lib/api/leads", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/leads")>("@/lib/api/leads");
  return {
    ...actual,
    getLeadDashboardSummary: () => mocks.getLeadDashboardSummary(),
    listLeads: (filters: unknown) => mocks.listLeads(filters),
    getLead: (id: string) => mocks.getLead(id),
    listLeadActivities: (id: string) => mocks.listLeadActivities(id),
  };
});

const lead = {
  id: "lead-1",
  property: {
    id: "property-1",
    title: "Ikoyi Maisonette",
    slug: "ikoyi-maisonette",
    listing_type: "sale",
    property_type: "house",
    price: "120000000.00",
    currency: "NGN",
    city: "Ikoyi",
    state: "Lagos",
  },
  interested_user: {
    id: "buyer-1",
    email: "buyer@example.com",
    full_name: "Ada Buyer",
    phone_number: null,
  },
  property_owner: {
    id: "owner-1",
    email: "owner@example.com",
    full_name: "Owner One",
    phone_number: null,
  },
  inquiry_type: "purchase",
  message: "I would like to inspect this home.",
  status: "new",
  pipeline_stage: "contacted",
  priority: "high",
  assigned_to: null,
  source: "property_detail",
  last_contacted_at: null,
  next_follow_up_at: null,
  follow_up_count: 0,
  closed_reason: "",
  conversion_value: null,
  converted_at: null,
  internal_notes: "Call in the evening.",
  created_at: "2026-08-12T09:00:00Z",
  updated_at: "2026-08-12T09:00:00Z",
};

describe("lead management pages", () => {
  it("renders the lead inbox with dashboard metrics and lead cards", async () => {
    mocks.getLeadDashboardSummary.mockResolvedValueOnce({
      total_leads: 1,
      new_leads: 0,
      contacted_leads: 1,
      upcoming_follow_ups: 0,
      viewing_conversion_rate: 25,
      application_conversion_rate: 10,
      converted_count: 0,
      closed_lost_count: 0,
      average_response_seconds: 3600,
    });
    mocks.listLeads.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [lead],
    });

    renderWithQueryClient(<LeadInboxPage />);

    expect(await screen.findByText("Lead Inbox")).toBeInTheDocument();
    expect(await screen.findByText("Ikoyi Maisonette")).toBeInTheDocument();
    expect(screen.getByText("Ada Buyer")).toBeInTheDocument();
    expect(screen.getAllByText("High").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Contacted").length).toBeGreaterThan(0);
  });

  it("renders lead detail with pipeline and activity controls", async () => {
    mocks.getLead.mockResolvedValueOnce(lead);
    mocks.listLeadActivities.mockResolvedValueOnce([
      {
        id: "activity-1",
        inquiry: "lead-1",
        actor: lead.property_owner,
        activity_type: "note",
        note: "Initial call completed.",
        scheduled_for: null,
        completed_at: null,
        created_at: "2026-08-12T10:00:00Z",
      },
    ]);

    renderWithQueryClient(<LeadDetailPage />);

    expect((await screen.findAllByText("Ikoyi Maisonette")).length).toBeGreaterThan(0);
    expect(screen.getByText("Lead from Ada Buyer")).toBeInTheDocument();
    expect(screen.getByText("Assign lead")).toBeInTheDocument();
    expect(screen.getByText("Move pipeline stage")).toBeInTheDocument();
    expect(screen.getByText("Activity timeline")).toBeInTheDocument();
    expect(await screen.findByText("Initial call completed.")).toBeInTheDocument();
  });
});
