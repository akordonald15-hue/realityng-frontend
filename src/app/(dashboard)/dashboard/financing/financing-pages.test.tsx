import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FinancingDashboardPage from "@/app/(dashboard)/dashboard/financing/page";
import FinancingDetailPage from "@/app/(dashboard)/dashboard/financing/[id]/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  listFinancingApplications: vi.fn(),
  listFinancingProducts: vi.fn(),
  getFinancingApplication: vi.fn(),
  consentToFinancingApplication: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "app-1" }),
  usePathname: () => "/dashboard/financing/app-1",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/financing", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/financing")>(
    "@/lib/api/financing",
  );
  return {
    ...actual,
    listFinancingApplications: () => mocks.listFinancingApplications(),
    listFinancingProducts: () => mocks.listFinancingProducts(),
    getFinancingApplication: (id: string) => mocks.getFinancingApplication(id),
    consentToFinancingApplication: (id: string) => mocks.consentToFinancingApplication(id),
  };
});

function product() {
  return {
    id: "product-1",
    partner: {
      id: "partner-1",
      name: "Manual Financing Partner",
      slug: "manual-finance",
      status: "active",
      partner_type: "manual",
      integration_mode: "manual",
      supported_products: ["rent_finance"],
      supported_states: ["Lagos"],
      minimum_amount: "100000.00",
      maximum_amount: "5000000.00",
      contact_policy: "Manual handoff only.",
      created_at: "2026-08-15T00:00:00Z",
      updated_at: "2026-08-15T00:00:00Z",
    },
    name: "Rent Finance",
    product_type: "rent_finance",
    status: "active",
    currency: "NGN",
    minimum_amount: "100000.00",
    maximum_amount: "5000000.00",
    minimum_tenor_months: 1,
    maximum_tenor_months: 12,
    requires_property: true,
    requires_income_documents: true,
    requires_identity_verification: true,
    requires_bank_statement: true,
    description: "Partner-reviewed rent finance.",
    document_requirements: [
      {
        id: "req-1",
        document_type: "identity",
        required: true,
        description: "Government ID.",
        allowed_mime_types: ["application/pdf"],
        max_size_mb: 10,
        created_at: "2026-08-15T00:00:00Z",
        updated_at: "2026-08-15T00:00:00Z",
      },
    ],
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  };
}

function application() {
  const financingProduct = product();
  return {
    id: "app-1",
    applicant: "user-1",
    property: "property-1",
    transaction: null,
    product: financingProduct,
    partner: financingProduct.partner,
    application_reference: "FIN-20260815-DEMO",
    status: "draft",
    requested_amount: "1200000.00",
    currency: "NGN",
    purpose: "Rent finance",
    preferred_tenor_months: 6,
    employment_status: "employed",
    monthly_income_band: "NGN 1m - 2m",
    state: "Lagos",
    city: "Lagos",
    consent_status: "not_granted",
    applicant_message: "",
    partner_status: "",
    partner_reference: "",
    submitted_at: null,
    partner_submitted_at: null,
    decision_at: null,
    documents: [],
    offers: [],
    timeline_events: [],
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  };
}

describe("financing pages", () => {
  it("renders applicant financing dashboard", async () => {
    mocks.listFinancingApplications.mockResolvedValue([application()]);
    mocks.listFinancingProducts.mockResolvedValue([product()]);

    renderWithQueryClient(<FinancingDashboardPage />);

    expect(await screen.findByText("FIN-20260815-DEMO")).toBeInTheDocument();
    expect(screen.getAllByText("Rent Finance").length).toBeGreaterThan(0);
  });

  it("renders application detail and grants consent", async () => {
    const user = userEvent.setup();
    mocks.getFinancingApplication.mockResolvedValue(application());
    mocks.consentToFinancingApplication.mockResolvedValue({
      ...application(),
      consent_status: "granted",
    });

    renderWithQueryClient(<FinancingDetailPage />);

    expect(await screen.findByText("Document checklist")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Grant consent" }));

    expect(mocks.consentToFinancingApplication).toHaveBeenCalledWith("app-1");
  });
});
