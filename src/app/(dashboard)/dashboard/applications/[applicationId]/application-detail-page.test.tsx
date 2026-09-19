import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ApplicationDetailPage from "@/app/(dashboard)/dashboard/applications/[applicationId]/page";
import type { RentalApplication } from "@/lib/api/applications";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  applicationId: "application-1",
  approveApplication: vi.fn(),
  getApplication: vi.fn(),
  markApplicationUnderReview: vi.fn(),
  rejectApplication: vi.fn(),
  updateApplicationNotes: vi.fn(),
  withdrawApplication: vi.fn(),
  currentUser: {
    id: "buyer-1",
    roles: [{ role: { name: "buyer" }, status: "approved" }],
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ applicationId: mocks.applicationId }),
}));

vi.mock("@/lib/api/applications", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/applications")>("@/lib/api/applications");
  return {
    ...actual,
    approveApplication: (applicationId: string) => mocks.approveApplication(applicationId),
    getApplication: (applicationId: string) => mocks.getApplication(applicationId),
    markApplicationUnderReview: (applicationId: string) =>
      mocks.markApplicationUnderReview(applicationId),
    rejectApplication: (applicationId: string) => mocks.rejectApplication(applicationId),
    updateApplicationNotes: (payload: { applicationId: string; ownerNotes: string }) =>
      mocks.updateApplicationNotes(payload),
    withdrawApplication: (applicationId: string) => mocks.withdrawApplication(applicationId),
  };
});

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    isLoading: false,
    user: mocks.currentUser,
  }),
}));

function application(overrides: Partial<RentalApplication> = {}): RentalApplication {
  return {
    id: "application-1",
    property: {
      id: "property-1",
      title: "Waterfront Banana Island Duplex",
      slug: "waterfront-banana-island-duplex",
      listing_type: "rent",
      property_type: "duplex",
      price: "20000000",
      currency: "NGN",
      city: "Ikoyi",
      state: "Lagos",
      cover_image_url: "https://images.example/property.jpg",
    },
    applicant: {
      id: "buyer-1",
      email: "buyer@realityng.com",
      full_name: "Ify Madu",
      phone_number: "+234 800 000 0000",
    },
    property_owner: {
      id: "agent-1",
      email: "agent@realityng.com",
      full_name: "Agent One",
      phone_number: "+234 811 000 0000",
    },
    inquiry: null,
    viewing: "viewing-1",
    full_name: "Ify Madu",
    email: "buyer@realityng.com",
    phone: "+234 800 000 0000",
    employment_status: "Employed",
    employer_name: "Diaspora Tech Holdings",
    monthly_income: "950000",
    gross_annual_income: null,
    income_currency: "NGN",
    additional_income_sources: [],
    move_in_date: "2026-09-15",
    message: "Ready to proceed.",
    status: "submitted",
    owner_notes: "",
    can_manage_application: false,
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-28T10:00:00Z",
    ...overrides,
  };
}

describe("ApplicationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.applicationId = "application-1";
    mocks.currentUser = {
      id: "buyer-1",
      roles: [{ role: { name: "buyer" }, status: "approved" }],
    };
  });

  it("shows annual income and source breakdown to the applicant", async () => {
    mocks.getApplication.mockResolvedValueOnce(application({
      monthly_income: null,
      gross_annual_income: "7200000.00",
      additional_income_sources: [{ source: "Consulting", annual_amount: "1200000.00" }],
    }));
    renderWithQueryClient(<ApplicationDetailPage />);
    expect(await screen.findByText("Gross yearly income")).toBeInTheDocument();
    expect(screen.getByText(/Consulting:/)).toBeInTheDocument();
    expect(screen.queryByText("Monthly income")).not.toBeInTheDocument();
  });

  it("renders the pending application detail state with real metadata and actions", async () => {
    mocks.getApplication.mockResolvedValueOnce(application({ status: "under_review" }));

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByRole("heading", { name: /₦20,000,000\/year/i })).toBeInTheDocument();
    expect(screen.getByText("Application pending")).toBeInTheDocument();
    expect(screen.getAllByText("Under Review").length).toBeGreaterThan(0);
    expect(screen.getByText("Waterfront Banana Island Duplex")).toBeInTheDocument();
    expect(screen.getByText("application-1")).toBeInTheDocument();
    expect(screen.getByText("15 Sept 2026")).toBeInTheDocument();
    expect(screen.getByText("Diaspora Tech Holdings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw application" })).toBeInTheDocument();
    expect(screen.queryByText("Owner notes")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve application" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View transactions" })).not.toBeInTheDocument();
    expect(screen.queryByText("Payment summary")).not.toBeInTheDocument();
  });

  it("renders the approved detail state without fake payment buttons", async () => {
    mocks.getApplication.mockResolvedValueOnce(application({ status: "approved" }));

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByText("Application approved")).toBeInTheDocument();
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
    expect(screen.getByText("Payment summary")).toBeInTheDocument();
    expect(screen.getByText("Property amount")).toBeInTheDocument();
    expect(screen.getAllByText("₦20,000,000").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "View transactions" })).toHaveAttribute(
      "href",
      "/dashboard/transactions",
    );
    expect(screen.getByRole("link", { name: "Need help paying" })).toHaveAttribute(
      "href",
      "/dashboard/financing",
    );
    expect(screen.queryByRole("button", { name: /make payment/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Withdraw application" })).not.toBeInTheDocument();
  });

  it("maps unsupported backend statuses to the shared detail layout", async () => {
    mocks.getApplication.mockResolvedValueOnce(application({ status: "rejected" }));

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByText("Application declined")).toBeInTheDocument();
    expect(screen.getAllByText("Rejected").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Browse properties" })).toHaveAttribute(
      "href",
      "/properties",
    );
  });

  it("uses the existing withdraw application action for pending applications", async () => {
    const user = userEvent.setup();
    mocks.getApplication.mockResolvedValue(application({ status: "submitted" }));
    mocks.withdrawApplication.mockResolvedValueOnce(application({ status: "withdrawn" }));

    renderWithQueryClient(<ApplicationDetailPage />);

    await user.click(await screen.findByRole("button", { name: "Withdraw application" }));

    await waitFor(() => expect(mocks.withdrawApplication).toHaveBeenCalledWith("application-1"));
  });

  it("renders the supply review variant for the property owner", async () => {
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValueOnce(
      application({
        can_manage_application: true,
        owner_notes: "Check employment documents.",
        gross_annual_income: "7200000.00",
        additional_income_sources: [{ source: "Private consulting", annual_amount: "1200000.00" }],
      }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByRole("heading", { name: "Application Details" })).toBeInTheDocument();
    expect(screen.getByText("Applicant information")).toBeInTheDocument();
    expect(screen.getByText("Ify Madu")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Check employment documents.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark under review" })).toBeInTheDocument();
    expect(screen.getByText("Gross yearly income")).toBeInTheDocument();
    expect(screen.queryByText(/Private consulting/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Withdraw application" })).not.toBeInTheDocument();
    expect(screen.queryByText("Payment summary")).not.toBeInTheDocument();
  });

  it("marks a submitted supply application under review after confirmation", async () => {
    const user = userEvent.setup();
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValue(
      application({ can_manage_application: true, status: "submitted" }),
    );
    mocks.markApplicationUnderReview.mockResolvedValueOnce(
      application({ can_manage_application: true, status: "under_review" }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    await user.click(await screen.findByRole("button", { name: "Mark under review" }));
    expect(
      screen.getByRole("dialog", { name: "Mark application under review?" }),
    ).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Mark under review" }).at(-1)!);

    await waitFor(() =>
      expect(mocks.markApplicationUnderReview).toHaveBeenCalledWith("application-1"),
    );
  });

  it("shows approve and reject actions only for under-review supply applications", async () => {
    const user = userEvent.setup();
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValue(
      application({ can_manage_application: true, status: "under_review" }),
    );
    mocks.approveApplication.mockResolvedValueOnce(
      application({ can_manage_application: true, status: "approved" }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByRole("button", { name: "Approve application" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject application" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark under review" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve application" }));
    expect(screen.getByRole("dialog", { name: "Approve application?" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Approve application" }).at(-1)!);

    await waitFor(() => expect(mocks.approveApplication).toHaveBeenCalledWith("application-1"));
  });

  it("saves supply owner notes without exposing them to applicants", async () => {
    const user = userEvent.setup();
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValue(
      application({
        can_manage_application: true,
        owner_notes: "Initial private notes.",
        status: "under_review",
      }),
    );
    mocks.updateApplicationNotes.mockResolvedValueOnce(
      application({
        can_manage_application: true,
        owner_notes: "Updated private notes.",
        status: "under_review",
      }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    const notes = await screen.findByLabelText("Owner notes");
    await user.clear(notes);
    await user.type(notes, "Updated private notes.");
    await user.click(screen.getByRole("button", { name: "Save notes" }));

    await waitFor(() =>
      expect(mocks.updateApplicationNotes).toHaveBeenCalledWith({
        applicationId: "application-1",
        ownerNotes: "Updated private notes.",
      }),
    );
  });

  it("hides terminal supply decision controls", async () => {
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValueOnce(
      application({ can_manage_application: true, status: "approved" }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByText(/has no available decision actions/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve application" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reject application" })).not.toBeInTheDocument();
  });

  it("does not grant supply controls to an assigned agent who is not the property owner", async () => {
    mocks.currentUser = {
      id: "assigned-agent-1",
      roles: [{ role: { name: "agent" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValueOnce(
      application({ can_manage_application: false, owner_notes: "" }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(
      await screen.findByText("This application is unavailable or you do not have access to view it."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private owner note")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve application" })).not.toBeInTheDocument();
  });

  it("allows an admin to use the supply-compatible review presentation", async () => {
    mocks.currentUser = {
      id: "admin-1",
      roles: [{ role: { name: "admin" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValueOnce(
      application({ can_manage_application: true, status: "under_review" }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByRole("heading", { name: "Application Details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve application" })).toBeInTheDocument();
  });

  it("shows decision API failures without changing the visible state optimistically", async () => {
    const user = userEvent.setup();
    mocks.currentUser = {
      id: "agent-1",
      roles: [{ role: { name: "landlord" }, status: "approved" }],
    };
    mocks.getApplication.mockResolvedValue(
      application({ can_manage_application: true, status: "under_review" }),
    );
    mocks.rejectApplication.mockRejectedValueOnce(new Error("Decision failed."));

    renderWithQueryClient(<ApplicationDetailPage />);

    await user.click(await screen.findByRole("button", { name: "Reject application" }));
    await user.click(screen.getAllByRole("button", { name: "Reject application" }).at(-1)!);

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getAllByText("Under Review").length).toBeGreaterThan(0);
  });

  it("handles not found or unauthorized application responses", async () => {
    mocks.getApplication.mockRejectedValueOnce(new Error("Application not found."));

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("handles missing optional property and payment data without failing the page", async () => {
    mocks.getApplication.mockResolvedValueOnce(
      application({
        status: "approved",
        property: {
          ...application().property,
          cover_image_url: undefined,
          price: "",
        },
        employer_name: "",
        monthly_income: "",
      }),
    );

    renderWithQueryClient(<ApplicationDetailPage />);

    expect(await screen.findByRole("heading", { name: "Price on request" })).toBeInTheDocument();
    expect(screen.getByText("RealityNG")).toBeInTheDocument();
    expect(screen.queryByText("Payment summary")).not.toBeInTheDocument();
  });
});
