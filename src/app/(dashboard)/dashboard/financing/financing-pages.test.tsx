import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FinancingDashboardPage from "@/app/(dashboard)/dashboard/financing/page";
import FinancingDetailPage from "@/app/(dashboard)/dashboard/financing/[id]/page";
import FinancingApplyPage from "@/app/(dashboard)/dashboard/financing/apply/page";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams(),
  listFinancingApplications: vi.fn(),
  listFinancingProducts: vi.fn(),
  getFinancingApplication: vi.fn(),
  consentToFinancingApplication: vi.fn(),
  createFinancingApplication: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "app-1" }),
  usePathname: () => "/dashboard/financing/app-1",
  useRouter: () => ({ replace: vi.fn(), push: mocks.push }),
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api/financing", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/financing")>("@/lib/api/financing");
  return {
    ...actual,
    listFinancingApplications: () => mocks.listFinancingApplications(),
    listFinancingProducts: () => mocks.listFinancingProducts(),
    getFinancingApplication: (id: string) => mocks.getFinancingApplication(id),
    consentToFinancingApplication: (id: string) => mocks.consentToFinancingApplication(id),
    createFinancingApplication: (payload: unknown) => mocks.createFinancingApplication(payload),
  };
});

function product(overrides = {}) {
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
    ...overrides,
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
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it("renders applicant financing dashboard", async () => {
    mocks.listFinancingApplications.mockResolvedValue([application()]);
    mocks.listFinancingProducts.mockResolvedValue([product()]);

    renderWithQueryClient(<FinancingDashboardPage />);

    expect(await screen.findByText("FIN-20260815-DEMO")).toBeInTheDocument();
    expect(screen.getAllByText("Rent Finance").length).toBeGreaterThan(0);
  });

  it("renders the Figma-aligned financing selector with supported products", async () => {
    mocks.listFinancingApplications.mockResolvedValue([]);
    mocks.listFinancingProducts.mockResolvedValue([product()]);

    renderWithQueryClient(<FinancingDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Property financing" })).toBeInTheDocument();
    expect(await screen.findByText("Manual Financing Partner")).toBeInTheDocument();
    expect(screen.getByText("Up to ₦5,000,000")).toBeInTheDocument();
    expect(screen.getByText("1-12 months")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      "/dashboard/financing/apply?product_id=product-1",
    );
  });

  it("supports keyboard-visible option selection before continuing", async () => {
    const user = userEvent.setup();
    mocks.listFinancingApplications.mockResolvedValue([]);
    mocks.listFinancingProducts.mockResolvedValue([product()]);

    renderWithQueryClient(<FinancingDashboardPage />);

    const option = await screen.findByRole("button", { name: /Manual Financing Partner/i });
    expect(option).toHaveAttribute("aria-pressed", "false");
    await user.click(option);
    expect(option).toHaveAttribute("aria-pressed", "true");
  });

  it("does not expose inactive financing products as fake working CTAs", async () => {
    mocks.listFinancingApplications.mockResolvedValue([]);
    mocks.listFinancingProducts.mockResolvedValue([product({ status: "draft" })]);

    renderWithQueryClient(<FinancingDashboardPage />);

    expect(await screen.findByText("No options")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Apply" })).not.toBeInTheDocument();
  });

  it("surfaces financing product API failures", async () => {
    mocks.listFinancingApplications.mockResolvedValue([]);
    mocks.listFinancingProducts.mockRejectedValue(new Error("Products unavailable"));

    renderWithQueryClient(<FinancingDashboardPage />);

    expect(await screen.findByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
  });

  it("preselects a supported product when entering the existing apply flow", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams("product_id=product-1");
    mocks.listFinancingProducts.mockResolvedValue([product()]);
    mocks.createFinancingApplication.mockResolvedValue(application());

    renderWithQueryClient(<FinancingApplyPage />);

    expect(await screen.findByText("Rent Finance")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Amount requested"), "1200000");
    await user.type(screen.getByLabelText("Monthly income band"), "NGN 1m - 2m");
    await user.type(screen.getByLabelText("Purpose"), "Rent finance support");
    await user.click(screen.getByRole("button", { name: "Create financing draft" }));

    expect(mocks.createFinancingApplication).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: "product-1" }),
    );
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
