import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminServiceAppealsPage from "@/app/(admin)/admin/services/appeals/page";
import AdminAppealDetailPage from "@/app/(admin)/admin/services/appeals/[id]/page";
import AdminServiceComplaintsPage from "@/app/(admin)/admin/services/complaints/page";
import AdminComplaintDetailPage from "@/app/(admin)/admin/services/complaints/[id]/page";
import ProviderAppealsPage from "@/app/(dashboard)/dashboard/artisan/appeals/page";
import ProviderAppealDetailPage from "@/app/(dashboard)/dashboard/artisan/appeals/[id]/page";
import ProviderComplaintsPage from "@/app/(dashboard)/dashboard/artisan/complaints/page";
import ProviderComplaintDetailPage from "@/app/(dashboard)/dashboard/artisan/complaints/[id]/page";
import CustomerComplaintsPage from "@/app/(dashboard)/dashboard/services/complaints/page";
import CustomerComplaintDetailPage from "@/app/(dashboard)/dashboard/services/complaints/[id]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  adminGetAppeal: vi.fn(),
  adminGetComplaint: vi.fn(),
  adminListAppeals: vi.fn(),
  adminListComplaints: vi.fn(),
  adminModerateAppeal: vi.fn(),
  adminModerateComplaint: vi.fn(),
  getMyServiceComplaint: vi.fn(),
  getMyProviderProfile: vi.fn(),
  getProviderAppeal: vi.fn(),
  getProviderComplaint: vi.fn(),
  listMyServiceComplaints: vi.fn(),
  listProviderAppeals: vi.fn(),
  listProviderComplaints: vi.fn(),
  submitProviderAppeal: vi.fn(),
  submitServiceComplaint: vi.fn(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "complaint-1" }),
}));

vi.mock("@/lib/api/services", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/services")>(
    "@/lib/api/services",
  );
  return {
    ...actual,
    adminGetAppeal: () => mocks.adminGetAppeal(),
    adminGetComplaint: () => mocks.adminGetComplaint(),
    adminListAppeals: () => mocks.adminListAppeals(),
    adminListComplaints: () => mocks.adminListComplaints(),
    adminModerateAppeal: (...args: unknown[]) => mocks.adminModerateAppeal(...args),
    adminModerateComplaint: (...args: unknown[]) => mocks.adminModerateComplaint(...args),
    getMyServiceComplaint: () => mocks.getMyServiceComplaint(),
    getMyProviderProfile: () => mocks.getMyProviderProfile(),
    getProviderAppeal: () => mocks.getProviderAppeal(),
    getProviderComplaint: () => mocks.getProviderComplaint(),
    listMyServiceComplaints: () => mocks.listMyServiceComplaints(),
    listProviderAppeals: () => mocks.listProviderAppeals(),
    listProviderComplaints: () => mocks.listProviderComplaints(),
    submitProviderAppeal: (payload: unknown) => mocks.submitProviderAppeal(payload),
    submitServiceComplaint: (payload: unknown) => mocks.submitServiceComplaint(payload),
  };
});

const provider = {
  id: "provider-1",
  slug: "bright-spark",
  provider_type: "individual",
  business_name: "Bright Spark Electrical",
  display_location: "Lekki, Lagos",
};

const complaint = {
  id: "complaint-1",
  complainant: "customer-1",
  complainant_email: "ada@example.com",
  provider,
  quote_request: null,
  review: null,
  booking: null,
  complaint_type: "customer",
  category: "service_quality",
  subject: "Repair follow-up needed",
  description: "The customer needs help resolving an incomplete service.",
  status: "open",
  assigned_admin: null,
  assigned_admin_email: "",
  resolution_notes: "",
  evidence: [],
  created_at: "2026-08-04T10:00:00Z",
  updated_at: "2026-08-04T10:00:00Z",
};

const appeal = {
  id: "appeal-1",
  provider,
  submitted_by: "provider-owner",
  submitted_by_email: "artisan@example.com",
  appeal_type: "suspension",
  reason: "We have resolved the governance issue.",
  status: "submitted",
  admin_notes: "",
  decided_by: null,
  decided_by_email: "",
  decided_at: null,
  created_at: "2026-08-04T10:00:00Z",
  updated_at: "2026-08-04T10:00:00Z",
};

describe("service governance pages", () => {
  it("renders and submits the customer complaint form", async () => {
    mocks.listMyServiceComplaints.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [complaint],
    });
    mocks.submitServiceComplaint.mockResolvedValueOnce(complaint);

    renderWithQueryClient(<CustomerComplaintsPage />);

    expect(await screen.findByText("My complaints")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Provider ID"), {
      target: { value: "provider-1" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "New complaint" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A service issue needs admin review." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit complaint" }));

    expect(await screen.findByText("Repair follow-up needed")).toBeInTheDocument();
  });

  it("renders provider complaints and appeals", async () => {
    mocks.listProviderComplaints.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [complaint],
    });
    mocks.getMyProviderProfile.mockResolvedValueOnce({
      ...provider,
      status: "suspended",
      warning_count: 1,
      suspended_reason: "Governance hold",
    });
    mocks.listProviderAppeals.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [appeal],
    });

    renderWithQueryClient(
      <>
        <ProviderComplaintsPage />
        <ProviderAppealsPage />
      </>,
    );

    expect(await screen.findByText("Complaints and moderation requests")).toBeInTheDocument();
    expect(await screen.findByText("Appeals")).toBeInTheDocument();
    expect(screen.getByText("Repair follow-up needed")).toBeInTheDocument();
    expect(screen.getByText("We have resolved the governance issue.")).toBeInTheDocument();
  });

  it("renders admin governance queues", async () => {
    mocks.adminListComplaints.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [complaint],
    });
    mocks.adminListAppeals.mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [appeal],
    });

    renderWithQueryClient(
      <>
        <AdminServiceComplaintsPage />
        <AdminServiceAppealsPage />
      </>,
    );

    expect(await screen.findByText("Complaints queue")).toBeInTheDocument();
    expect(await screen.findByText("Provider appeals")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review, resolve, reject, escalate, or close services marketplace complaints.",
      ),
    ).toBeInTheDocument();
  });

  it("renders governance detail pages", async () => {
    mocks.getMyServiceComplaint.mockResolvedValueOnce(complaint);
    mocks.getProviderComplaint.mockResolvedValueOnce(complaint);
    mocks.getProviderAppeal.mockResolvedValueOnce(appeal);
    mocks.adminGetComplaint.mockResolvedValueOnce(complaint);
    mocks.adminGetAppeal.mockResolvedValueOnce(appeal);

    renderWithQueryClient(
      <>
        <CustomerComplaintDetailPage />
        <ProviderComplaintDetailPage />
        <ProviderAppealDetailPage />
        <AdminComplaintDetailPage />
        <AdminAppealDetailPage />
      </>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("Moderation timeline")).toHaveLength(3);
      expect(screen.getAllByText("Decision details")).toHaveLength(2);
    });
  });
});
