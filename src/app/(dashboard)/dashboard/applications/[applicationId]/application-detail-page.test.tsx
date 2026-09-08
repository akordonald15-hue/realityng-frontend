import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ApplicationDetailPage from "@/app/(dashboard)/dashboard/applications/[applicationId]/page";
import type { RentalApplication } from "@/lib/api/applications";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  applicationId: "application-1",
  getApplication: vi.fn(),
  withdrawApplication: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ applicationId: mocks.applicationId }),
}));

vi.mock("@/lib/api/applications", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/applications")>("@/lib/api/applications");
  return {
    ...actual,
    getApplication: (applicationId: string) => mocks.getApplication(applicationId),
    withdrawApplication: (applicationId: string) => mocks.withdrawApplication(applicationId),
  };
});

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
    move_in_date: "2026-09-15",
    message: "Ready to proceed.",
    status: "submitted",
    owner_notes: "",
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-28T10:00:00Z",
    ...overrides,
  };
}

describe("ApplicationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.applicationId = "application-1";
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
