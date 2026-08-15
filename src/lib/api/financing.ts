import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export type FinancingApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "partner_review"
  | "more_information_requested"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "rejected"
  | "cancelled"
  | "expired";

export type FinancingProductType = "rent_finance" | "mortgage";
export type FinancingOfferStatus =
  | "pending"
  | "active"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

export type FinancingPartner = {
  id: string;
  name: string;
  slug: string;
  status: string;
  partner_type: string;
  integration_mode: "manual" | "api" | "hybrid";
  supported_products: string[];
  supported_states: string[];
  minimum_amount: string;
  maximum_amount: string;
  contact_policy: string;
  created_at: string;
  updated_at: string;
};

export type FinancingDocumentRequirement = {
  id: string;
  document_type: string;
  required: boolean;
  description: string;
  allowed_mime_types: string[];
  max_size_mb: number;
  created_at: string;
  updated_at: string;
};

export type FinancingProduct = {
  id: string;
  partner: FinancingPartner;
  name: string;
  product_type: FinancingProductType;
  status: string;
  currency: string;
  minimum_amount: string;
  maximum_amount: string;
  minimum_tenor_months: number;
  maximum_tenor_months: number;
  requires_property: boolean;
  requires_income_documents: boolean;
  requires_identity_verification: boolean;
  requires_bank_statement: boolean;
  description: string;
  document_requirements: FinancingDocumentRequirement[];
  created_at: string;
  updated_at: string;
};

export type FinancingDocument = {
  id: string;
  application: string;
  uploaded_by: string;
  document_type: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  status: "uploaded" | "under_review" | "accepted" | "rejected";
  rejection_reason: string;
  created_at: string;
  updated_at: string;
};

export type FinancingOffer = {
  id: string;
  application: string;
  partner: FinancingPartner;
  offer_reference: string;
  status: FinancingOfferStatus;
  approved_amount: string;
  currency: string;
  tenor_months: number;
  interest_rate_display: string;
  fees_display: string;
  monthly_payment_display: string;
  partner_terms_summary: string;
  expires_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancingTimelineEvent = {
  id: string;
  event_type: string;
  message: string;
  visibility: "internal" | "applicant" | "partner";
  created_at: string;
};

export type FinancingApplication = {
  id: string;
  applicant: string;
  property: string | null;
  transaction: string | null;
  product: FinancingProduct;
  partner: FinancingPartner;
  application_reference: string;
  status: FinancingApplicationStatus;
  requested_amount: string;
  currency: string;
  purpose: string;
  preferred_tenor_months: number;
  employment_status: string;
  monthly_income_band: string;
  state: string;
  city: string;
  consent_status: "not_granted" | "granted" | "revoked";
  applicant_message: string;
  partner_status: string;
  partner_reference: string;
  submitted_at: string | null;
  partner_submitted_at: string | null;
  decision_at: string | null;
  documents: FinancingDocument[];
  offers: FinancingOffer[];
  timeline_events: FinancingTimelineEvent[];
  created_at: string;
  updated_at: string;
};

export type FinancingApplicationPayload = {
  product_id: string;
  property_id?: string | null;
  transaction_id?: string | null;
  requested_amount: string;
  currency?: string;
  purpose: string;
  preferred_tenor_months: number;
  employment_status: string;
  monthly_income_band: string;
  state: string;
  city?: string;
  applicant_message?: string;
};

const mockPartner: FinancingPartner = {
  id: "partner-1",
  name: "Manual Financing Partner",
  slug: "manual-finance",
  status: "active",
  partner_type: "manual",
  integration_mode: "manual",
  supported_products: ["rent_finance", "mortgage"],
  supported_states: ["Lagos", "Abuja"],
  minimum_amount: "100000.00",
  maximum_amount: "50000000.00",
  contact_policy: "RealityNG operations submits manually after applicant consent.",
  created_at: "2026-08-15T00:00:00Z",
  updated_at: "2026-08-15T00:00:00Z",
};

const mockProducts: FinancingProduct[] = [
  {
    id: "product-rent",
    partner: mockPartner,
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
    description: "Apply through RealityNG for partner-reviewed rent financing.",
    document_requirements: [
      {
        id: "req-id",
        document_type: "identity",
        required: true,
        description: "Government-issued ID.",
        allowed_mime_types: ["application/pdf", "image/jpeg", "image/png"],
        max_size_mb: 10,
        created_at: "2026-08-15T00:00:00Z",
        updated_at: "2026-08-15T00:00:00Z",
      },
      {
        id: "req-bank",
        document_type: "bank_statement",
        required: true,
        description: "Recent bank statement.",
        allowed_mime_types: ["application/pdf", "image/jpeg", "image/png"],
        max_size_mb: 10,
        created_at: "2026-08-15T00:00:00Z",
        updated_at: "2026-08-15T00:00:00Z",
      },
    ],
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
];

const mockApplication: FinancingApplication = {
  id: "financing-1",
  applicant: "user-1",
  property: "property-1",
  transaction: null,
  product: mockProducts[0],
  partner: mockPartner,
  application_reference: "FIN-20260815-DEMO",
  status: "offer_received",
  requested_amount: "1200000.00",
  currency: "NGN",
  purpose: "Finance annual rent.",
  preferred_tenor_months: 6,
  employment_status: "employed",
  monthly_income_band: "NGN 1m - 2m",
  state: "Lagos",
  city: "Lagos",
  consent_status: "granted",
  applicant_message: "Need rent support.",
  partner_status: "offer_received",
  partner_reference: "partner-sub-1",
  submitted_at: "2026-08-15T10:00:00Z",
  partner_submitted_at: "2026-08-15T11:00:00Z",
  decision_at: "2026-08-15T12:00:00Z",
  documents: [],
  offers: [
    {
      id: "offer-1",
      application: "financing-1",
      partner: mockPartner,
      offer_reference: "offer-demo",
      status: "active",
      approved_amount: "1000000.00",
      currency: "NGN",
      tenor_months: 6,
      interest_rate_display: "Partner-provided rate",
      fees_display: "Partner-provided fees",
      monthly_payment_display: "Partner-provided repayment",
      partner_terms_summary: "Final terms are owned by the financing partner.",
      expires_at: null,
      accepted_at: null,
      declined_at: null,
      created_at: "2026-08-15T12:00:00Z",
      updated_at: "2026-08-15T12:00:00Z",
    },
  ],
  timeline_events: [
    {
      id: "timeline-1",
      event_type: "financing_application_submitted",
      message: "Financing application submitted for RealityNG review.",
      visibility: "applicant",
      created_at: "2026-08-15T10:00:00Z",
    },
  ],
  created_at: "2026-08-15T09:00:00Z",
  updated_at: "2026-08-15T12:00:00Z",
};

export async function listFinancingProducts(): Promise<FinancingProduct[]> {
  if (USE_MOCKS) return mockProducts;
  const response = await apiClient.get<FinancingProduct[] | PaginatedResponse<FinancingProduct>>(
    "/financing-products/",
  );
  return unwrapList(response.data);
}

export async function listFinancingApplications(): Promise<FinancingApplication[]> {
  if (USE_MOCKS) return [mockApplication];
  const response = await apiClient.get<
    FinancingApplication[] | PaginatedResponse<FinancingApplication>
  >("/financing-applications/my/");
  return unwrapList(response.data);
}

export async function getFinancingApplication(id: string): Promise<FinancingApplication> {
  if (USE_MOCKS) return { ...mockApplication, id };
  const response = await apiClient.get<FinancingApplication>(`/financing-applications/${id}/`);
  return response.data;
}

export async function createFinancingApplication(
  payload: FinancingApplicationPayload,
): Promise<FinancingApplication> {
  const response = await apiClient.post<FinancingApplication>(
    "/financing-applications/",
    payload,
  );
  return response.data;
}

export async function consentToFinancingApplication(id: string): Promise<FinancingApplication> {
  const response = await apiClient.post<FinancingApplication>(
    `/financing-applications/${id}/consent/`,
    { scope: "financing_partner_submission" },
  );
  return response.data;
}

export async function submitFinancingApplication(id: string): Promise<FinancingApplication> {
  const response = await apiClient.post<FinancingApplication>(
    `/financing-applications/${id}/submit/`,
  );
  return response.data;
}

export async function uploadFinancingDocument({
  applicationId,
  documentType,
  file,
}: {
  applicationId: string;
  documentType: string;
  file: File;
}): Promise<FinancingDocument> {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", file);
  const response = await apiClient.post<FinancingDocument>(
    `/financing-applications/${applicationId}/documents/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function acceptFinancingOffer(offerId: string): Promise<FinancingOffer> {
  const response = await apiClient.post<FinancingOffer>(`/financing-offers/${offerId}/accept/`);
  return response.data;
}

export async function declineFinancingOffer(offerId: string): Promise<FinancingOffer> {
  const response = await apiClient.post<FinancingOffer>(`/financing-offers/${offerId}/decline/`);
  return response.data;
}

export async function listAdminFinancingApplications(): Promise<FinancingApplication[]> {
  if (USE_MOCKS) return [mockApplication];
  const response = await apiClient.get<
    FinancingApplication[] | PaginatedResponse<FinancingApplication>
  >("/admin-financing-applications/");
  return unwrapList(response.data);
}

export async function getAdminFinancingApplication(id: string): Promise<FinancingApplication> {
  if (USE_MOCKS) return { ...mockApplication, id };
  const response = await apiClient.get<FinancingApplication>(
    `/admin-financing-applications/${id}/`,
  );
  return response.data;
}

export async function submitFinancingToPartner({
  applicationId,
  submissionReference,
}: {
  applicationId: string;
  submissionReference: string;
}): Promise<unknown> {
  const response = await apiClient.post(
    `/admin-financing-applications/${applicationId}/submit-to-partner/`,
    { submission_reference: submissionReference },
  );
  return response.data;
}

export async function recordFinancingOffer({
  applicationId,
  offerReference,
  approvedAmount,
  tenorMonths,
}: {
  applicationId: string;
  offerReference: string;
  approvedAmount: string;
  tenorMonths: number;
}): Promise<FinancingOffer> {
  const response = await apiClient.post<FinancingOffer>(
    `/admin-financing-applications/${applicationId}/record-offer/`,
    {
      offer_reference: offerReference,
      approved_amount: approvedAmount,
      currency: "NGN",
      tenor_months: tenorMonths,
      interest_rate_display: "Partner-provided rate",
    },
  );
  return response.data;
}
