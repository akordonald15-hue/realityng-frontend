import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockApproveWalkthrough,
  mockCancelInspectionRequest,
  mockCreateInspectionReport,
  mockCreateInspectionRequest,
  mockGetAdminInspectionDashboard,
  mockGetCustomerInspectionDashboard,
  mockGetInspectionReport,
  mockGetInspectionRequest,
  mockGetInspectorInspectionDashboard,
  mockListAdminInspectionRequests,
  mockListAdminReports,
  mockListAdminWalkthroughs,
  mockListInspectionTimeline,
  mockListInspectorAssignments,
  mockListInspectors,
  mockListManagedWalkthroughs,
  mockListMyInspectionRequests,
  mockListPublicWalkthroughs,
  mockRejectWalkthrough,
  mockSubmitWalkthrough,
  mockUploadInspectionEvidence,
  mockUploadWalkthrough,
} from "@/mocks/mock-inspections";

type UserSummary = {
  id: string;
  email: string;
  full_name: string;
};

type PropertySummary = {
  id: string;
  title: string;
  slug?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
};

export type InspectionType =
  | "general"
  | "pre_purchase"
  | "pre_rental"
  | "structural"
  | "electrical"
  | "plumbing"
  | "construction_progress"
  | "land_verification"
  | "commercial"
  | "other";

export type InspectionRequestStatus =
  | "requested"
  | "under_review"
  | "needs_more_information"
  | "approved"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "report_submitted"
  | "report_under_review"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type WalkthroughStatus =
  | "draft"
  | "uploading"
  | "pending_review"
  | "approved"
  | "rejected"
  | "hidden"
  | "archived"
  | "failed";

export type InspectionReportStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_revision"
  | "approved"
  | "rejected"
  | "archived";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type InspectionRequest = {
  id: string;
  property: PropertySummary;
  requester?: UserSummary;
  assigned_inspector?: UserSummary | null;
  inspection_type: InspectionType;
  purpose: string;
  description: string;
  preferred_date: string;
  alternative_date?: string | null;
  contact_phone: string;
  contact_email: string;
  access_notes?: string;
  status: InspectionRequestStatus;
  priority?: "low" | "normal" | "high" | "urgent";
  scheduled_for?: string | null;
  timezone?: string;
  estimated_duration_minutes?: number | null;
  access_instructions?: string;
  started_at?: string | null;
  report_submitted_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
};

export type InspectionRequestPayload = {
  property_id: string;
  inspection_type: InspectionType;
  purpose: string;
  description: string;
  preferred_date: string;
  alternative_date?: string | null;
  contact_phone: string;
  contact_email: string;
  access_notes?: string;
};

export type PropertyWalkthrough = {
  id: string;
  property?: PropertySummary;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number | null;
  display_order?: number;
  is_featured?: boolean;
  status?: WalkthroughStatus;
  moderation_reason?: string;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WalkthroughPayload = {
  title: string;
  description?: string;
  video_file: File;
};

export type InspectorProfile = {
  id: string;
  user: UserSummary;
  display_name: string;
  professional_title: string;
  bio: string;
  inspection_types: string[];
  service_areas: string[];
  verification_status: "pending" | "approved" | "rejected" | "suspended";
  availability_status: "available" | "limited" | "unavailable";
  active: boolean;
  completed_inspections: number;
  created_at: string;
  updated_at?: string;
};

export type InspectionAssignment = {
  id: string;
  inspection_request: InspectionRequest;
  inspector: UserSummary;
  assigned_by: UserSummary;
  status: "assigned" | "accepted" | "declined" | "cancelled" | "reassigned" | "completed";
  notes?: string;
  decline_reason?: string;
  assigned_at: string;
  accepted_at?: string | null;
  declined_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type InspectionEvidence = {
  id: string;
  evidence_type: "photo" | "video" | "document" | "voice_note" | "other";
  signed_url: string;
  mime_type: string;
  file_size: number;
  caption?: string;
  category: string;
  captured_at?: string | null;
  display_order?: number;
  visibility: string;
  uploaded_by?: UserSummary;
  created_at: string;
  updated_at?: string;
};

export type InspectionReport = {
  id: string;
  inspection_request: InspectionRequest;
  inspector?: UserSummary;
  summary: string;
  overall_condition: string;
  recommendation: string;
  risk_level: string;
  structural_notes?: string;
  electrical_notes?: string;
  plumbing_notes?: string;
  roofing_notes?: string;
  security_notes?: string;
  environment_notes?: string;
  accessibility_notes?: string;
  estimated_repair_notes?: string;
  report_document_signed_url?: string;
  report_document_mime_type?: string;
  report_document_file_size?: number | null;
  status: InspectionReportStatus;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  approved_at?: string | null;
  rejection_reason?: string;
  evidence: InspectionEvidence[];
  created_at: string;
  updated_at?: string;
};

export type TimelineEvent = {
  id: string;
  event_type: string;
  description: string;
  actor_label: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  detail?: string;
};

export type InspectionDashboard = {
  stats: DashboardStat[];
  recent_requests: InspectionRequest[];
  pending_assignments?: InspectionAssignment[];
};

export type AdminInspectionDashboard = InspectionDashboard & {
  pending_walkthroughs?: PropertyWalkthrough[];
  pending_reports?: InspectionReport[];
};

export type PaginatedInspectionRequests = Paginated<InspectionRequest>;
export type PaginatedInspectionWalkthroughs = Paginated<PropertyWalkthrough>;
export type PaginatedInspectionReports = Paginated<InspectionReport>;

export async function createInspectionRequest(
  payload: InspectionRequestPayload,
): Promise<InspectionRequest> {
  if (USE_MOCKS) return mockCreateInspectionRequest(payload);
  const response = await apiClient.post<InspectionRequest>("/inspections/requests/", payload);
  return response.data;
}

export async function listMyInspectionRequests(): Promise<PaginatedInspectionRequests> {
  if (USE_MOCKS) return mockListMyInspectionRequests();
  const response = await apiClient.get<PaginatedInspectionRequests>("/inspections/requests/my/");
  return response.data;
}

export async function getInspectionRequest(id: string): Promise<InspectionRequest> {
  if (USE_MOCKS) return mockGetInspectionRequest();
  const response = await apiClient.get<InspectionRequest>(`/inspections/requests/${id}/`);
  return response.data;
}

export async function cancelInspectionRequest(id: string, reason: string): Promise<InspectionRequest> {
  if (USE_MOCKS) return mockCancelInspectionRequest();
  const response = await apiClient.post<InspectionRequest>(`/inspections/requests/${id}/cancel/`, {
    reason,
  });
  return response.data;
}

export async function listInspectionTimeline(id: string): Promise<TimelineEvent[]> {
  if (USE_MOCKS) return mockListInspectionTimeline();
  const response = await apiClient.get<TimelineEvent[]>(`/inspections/requests/${id}/timeline/`);
  return response.data;
}

export async function getInspectionReportForRequest(id: string): Promise<InspectionReport> {
  if (USE_MOCKS) return mockGetInspectionReport();
  const response = await apiClient.get<InspectionReport>(`/inspections/requests/${id}/report/`);
  return response.data;
}

export async function listPublicWalkthroughs(propertyId: string): Promise<PropertyWalkthrough[]> {
  if (USE_MOCKS) return mockListPublicWalkthroughs();
  const response = await apiClient.get<PropertyWalkthrough[]>(
    `/inspections/properties/${propertyId}/walkthroughs/public/`,
  );
  return response.data;
}

export async function uploadWalkthrough(
  propertyId: string,
  payload: WalkthroughPayload,
): Promise<PropertyWalkthrough> {
  if (USE_MOCKS) return mockUploadWalkthrough(propertyId, payload);
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description ?? "");
  formData.append("video_file", payload.video_file);
  const response = await apiClient.post<PropertyWalkthrough>(
    `/inspections/properties/${propertyId}/walkthroughs/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function listManagedWalkthroughs(
  status?: WalkthroughStatus,
): Promise<PaginatedInspectionWalkthroughs> {
  if (USE_MOCKS) return mockListManagedWalkthroughs();
  const response = await apiClient.get<PaginatedInspectionWalkthroughs>(
    "/inspections/walkthroughs/manage/",
    { params: status ? { status } : undefined },
  );
  return response.data;
}

export async function submitWalkthrough(id: string): Promise<PropertyWalkthrough> {
  if (USE_MOCKS) return mockSubmitWalkthrough(id);
  const response = await apiClient.post<PropertyWalkthrough>(`/inspections/walkthroughs/${id}/submit/`);
  return response.data;
}

export async function setFeaturedWalkthrough(id: string): Promise<PropertyWalkthrough> {
  const response = await apiClient.post<PropertyWalkthrough>(
    `/inspections/walkthroughs/${id}/set-featured/`,
  );
  return response.data;
}

export async function listInspectorAssignments(): Promise<InspectionAssignment[]> {
  if (USE_MOCKS) return mockListInspectorAssignments();
  const response = await apiClient.get<Paginated<InspectionAssignment> | InspectionAssignment[]>(
    "/inspections/assignments/",
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
}

export async function acceptInspectionAssignment(id: string): Promise<InspectionAssignment> {
  const response = await apiClient.post<InspectionAssignment>(`/inspections/assignments/${id}/accept/`);
  return response.data;
}

export async function declineInspectionAssignment(
  id: string,
  reason: string,
): Promise<InspectionAssignment> {
  const response = await apiClient.post<InspectionAssignment>(
    `/inspections/assignments/${id}/decline/`,
    { reason },
  );
  return response.data;
}

export async function createInspectionReport(
  requestId: string,
  payload: FormData,
): Promise<InspectionReport> {
  if (USE_MOCKS) return mockCreateInspectionReport();
  const response = await apiClient.post<InspectionReport>(
    `/inspections/requests/${requestId}/report/`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function submitInspectionReport(id: string): Promise<InspectionReport> {
  const response = await apiClient.post<InspectionReport>(`/inspections/reports/${id}/submit/`);
  return response.data;
}

export async function uploadInspectionEvidence(
  reportId: string,
  payload: FormData,
): Promise<InspectionEvidence> {
  if (USE_MOCKS) return mockUploadInspectionEvidence();
  const response = await apiClient.post<InspectionEvidence>(
    `/inspections/reports/${reportId}/evidence/`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function getEvidenceSignedUrl(id: string): Promise<{ url: string }> {
  const response = await apiClient.get<{ url: string }>(`/inspections/evidence/${id}/signed-url/`);
  return response.data;
}

export async function getCustomerInspectionDashboard(): Promise<InspectionDashboard> {
  if (USE_MOCKS) return mockGetCustomerInspectionDashboard();
  const response = await apiClient.get<InspectionDashboard>("/inspections/dashboard/customer/");
  return response.data;
}

export async function getInspectorInspectionDashboard(): Promise<InspectionDashboard> {
  if (USE_MOCKS) return mockGetInspectorInspectionDashboard();
  const response = await apiClient.get<InspectionDashboard>("/inspections/dashboard/inspector/");
  return response.data;
}

export async function getAdminInspectionDashboard(): Promise<AdminInspectionDashboard> {
  if (USE_MOCKS) return mockGetAdminInspectionDashboard();
  const response = await apiClient.get<AdminInspectionDashboard>("/inspections/dashboard/admin/");
  return response.data;
}

export async function adminListInspectionRequests(
  status?: InspectionRequestStatus,
): Promise<PaginatedInspectionRequests> {
  if (USE_MOCKS) return mockListAdminInspectionRequests();
  const response = await apiClient.get<PaginatedInspectionRequests>("/inspections/admin/requests/", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function adminApproveInspectionRequest(id: string): Promise<InspectionRequest> {
  const response = await apiClient.post<InspectionRequest>(`/inspections/admin/requests/${id}/approve/`);
  return response.data;
}

export async function adminRejectInspectionRequest(
  id: string,
  reason: string,
): Promise<InspectionRequest> {
  const response = await apiClient.post<InspectionRequest>(`/inspections/admin/requests/${id}/reject/`, {
    reason,
  });
  return response.data;
}

export async function adminAssignInspectionRequest(payload: {
  requestId: string;
  inspector_id: string;
  scheduled_for?: string;
  timezone?: string;
  estimated_duration_minutes?: number;
  access_instructions?: string;
}): Promise<InspectionAssignment> {
  const { requestId, ...body } = payload;
  const response = await apiClient.post<InspectionAssignment>(
    `/inspections/admin/requests/${requestId}/assign/`,
    body,
  );
  return response.data;
}

export async function adminListWalkthroughs(
  status?: WalkthroughStatus,
): Promise<PaginatedInspectionWalkthroughs> {
  if (USE_MOCKS) return mockListAdminWalkthroughs();
  const response = await apiClient.get<PaginatedInspectionWalkthroughs>(
    "/inspections/admin/walkthroughs/",
    { params: status ? { status } : undefined },
  );
  return response.data;
}

export async function adminApproveWalkthrough(id: string): Promise<PropertyWalkthrough> {
  if (USE_MOCKS) return mockApproveWalkthrough(id);
  const response = await apiClient.post<PropertyWalkthrough>(
    `/inspections/admin/walkthroughs/${id}/approve/`,
  );
  return response.data;
}

export async function adminRejectWalkthrough(
  id: string,
  reason: string,
): Promise<PropertyWalkthrough> {
  if (USE_MOCKS) return mockRejectWalkthrough(id);
  const response = await apiClient.post<PropertyWalkthrough>(
    `/inspections/admin/walkthroughs/${id}/reject/`,
    { reason },
  );
  return response.data;
}

export async function adminListReports(
  status?: InspectionReportStatus,
): Promise<PaginatedInspectionReports> {
  if (USE_MOCKS) return mockListAdminReports();
  const response = await apiClient.get<PaginatedInspectionReports>("/inspections/admin/reports/", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function adminApproveReport(id: string): Promise<InspectionReport> {
  const response = await apiClient.post<InspectionReport>(`/inspections/admin/reports/${id}/approve/`);
  return response.data;
}

export async function adminRequestReportRevision(
  id: string,
  reason: string,
): Promise<InspectionReport> {
  const response = await apiClient.post<InspectionReport>(
    `/inspections/admin/reports/${id}/request-revision/`,
    { reason },
  );
  return response.data;
}

export async function adminListInspectors(): Promise<InspectorProfile[]> {
  if (USE_MOCKS) return mockListInspectors();
  const response = await apiClient.get<Paginated<InspectorProfile> | InspectorProfile[]>(
    "/inspections/admin/inspectors/",
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
}
