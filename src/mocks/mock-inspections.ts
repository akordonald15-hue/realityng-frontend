import type {
  AdminInspectionDashboard,
  InspectionAssignment,
  InspectionDashboard,
  InspectionEvidence,
  InspectionReport,
  InspectionRequest,
  InspectionRequestPayload,
  InspectorProfile,
  PaginatedInspectionRequests,
  PaginatedInspectionReports,
  PaginatedInspectionWalkthroughs,
  PropertyWalkthrough,
  TimelineEvent,
  WalkthroughPayload,
} from "@/lib/api/inspections";

const now = new Date().toISOString();

const propertySummary = {
  id: "property-demo-1",
  title: "Verified 3-bedroom apartment in Lekki",
  slug: "verified-3-bedroom-apartment-lekki",
  location: "Lekki, Lagos",
};

export const mockInspectionRequest: InspectionRequest = {
  id: "inspection-demo-1",
  property: propertySummary,
  requester: {
    id: "user-demo-1",
    email: "buyer@example.com",
    full_name: "Verified buyer",
  },
  assigned_inspector: null,
  inspection_type: "pre_purchase",
  purpose: "I want an independent review before making a payment decision.",
  description: "Please confirm property condition, utilities, and visible structural concerns.",
  preferred_date: "2026-08-12",
  alternative_date: "2026-08-13",
  contact_phone: "08000000000",
  contact_email: "buyer@example.com",
  access_notes: "Contact the listed representative before arrival.",
  status: "requested",
  priority: "normal",
  scheduled_for: null,
  timezone: "Africa/Lagos",
  estimated_duration_minutes: null,
  access_instructions: "",
  created_at: now,
  updated_at: now,
};

export const mockWalkthrough: PropertyWalkthrough = {
  id: "walkthrough-demo-1",
  property: propertySummary,
  title: "Living room and exterior walkthrough",
  description: "Moderated walkthrough showing the main spaces and exterior frontage.",
  video_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  thumbnail_url: "",
  duration_seconds: 48,
  display_order: 1,
  is_featured: true,
  status: "approved",
  moderation_reason: "",
  published_at: now,
  created_at: now,
  updated_at: now,
};

export const mockInspector: InspectorProfile = {
  id: "inspector-demo-1",
  user: {
    id: "inspector-user-1",
    email: "inspector@example.com",
    full_name: "RealityNG Inspector",
  },
  display_name: "RealityNG Inspector",
  professional_title: "Property inspection specialist",
  bio: "Independent inspection operator for RealityNG property evidence workflows.",
  inspection_types: ["pre_purchase", "pre_rental", "general"],
  service_areas: ["Lagos", "Abuja"],
  verification_status: "approved",
  availability_status: "available",
  active: true,
  completed_inspections: 12,
  created_at: now,
  updated_at: now,
};

export const mockReport: InspectionReport = {
  id: "report-demo-1",
  inspection_request: {
    ...mockInspectionRequest,
    status: "completed",
    assigned_inspector: mockInspector.user,
  },
  inspector: mockInspector.user,
  summary: "The inspected areas were generally presentable with normal maintenance items.",
  overall_condition: "good",
  recommendation: "Proceed only after confirming legal documents and repairing noted fixtures.",
  risk_level: "moderate",
  structural_notes: "No obvious major cracks were visible in inspected spaces.",
  electrical_notes: "Basic fittings were visible. Full load testing was not performed.",
  plumbing_notes: "Visible plumbing fixtures require routine checks.",
  roofing_notes: "",
  security_notes: "Estate access was controlled.",
  environment_notes: "Road access was fair at the time of inspection.",
  accessibility_notes: "",
  estimated_repair_notes: "Minor maintenance allowance recommended.",
  report_document_signed_url: "",
  report_document_mime_type: "application/pdf",
  report_document_file_size: 124000,
  status: "approved",
  submitted_at: now,
  reviewed_at: now,
  approved_at: now,
  rejection_reason: "",
  evidence: [],
  created_at: now,
  updated_at: now,
};

const page = <T>(results: T[]) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

export async function mockCreateInspectionRequest(
  payload: InspectionRequestPayload,
): Promise<InspectionRequest> {
  return {
    ...mockInspectionRequest,
    id: `inspection-${Date.now()}`,
    property: { ...propertySummary, id: payload.property_id },
    inspection_type: payload.inspection_type,
    purpose: payload.purpose,
    description: payload.description,
    preferred_date: payload.preferred_date,
    alternative_date: payload.alternative_date ?? null,
    contact_phone: payload.contact_phone,
    contact_email: payload.contact_email,
    access_notes: payload.access_notes ?? "",
    status: "requested",
  };
}

export async function mockListMyInspectionRequests(): Promise<PaginatedInspectionRequests> {
  return page([mockInspectionRequest]);
}

export async function mockGetInspectionRequest(): Promise<InspectionRequest> {
  return mockInspectionRequest;
}

export async function mockCancelInspectionRequest(): Promise<InspectionRequest> {
  return { ...mockInspectionRequest, status: "cancelled" };
}

export async function mockListInspectionTimeline(): Promise<TimelineEvent[]> {
  return [
    {
      id: "timeline-1",
      event_type: "InspectionRequested",
      description: "Inspection request submitted.",
      actor_label: "Verified buyer",
      metadata: {},
      created_at: now,
    },
    {
      id: "timeline-2",
      event_type: "InspectionUnderReview",
      description: "RealityNG operations is reviewing the request.",
      actor_label: "RealityNG",
      metadata: {},
      created_at: now,
    },
  ];
}

export async function mockGetInspectionReport(): Promise<InspectionReport> {
  return mockReport;
}

export async function mockListPublicWalkthroughs(): Promise<PropertyWalkthrough[]> {
  return [mockWalkthrough];
}

export async function mockUploadWalkthrough(
  propertyId: string,
  payload: WalkthroughPayload,
): Promise<PropertyWalkthrough> {
  return {
    ...mockWalkthrough,
    id: `walkthrough-${Date.now()}`,
    property: { ...propertySummary, id: propertyId },
    title: payload.title,
    description: payload.description ?? "",
    status: "draft",
    video_url: "",
  };
}

export async function mockListManagedWalkthroughs(): Promise<PaginatedInspectionWalkthroughs> {
  return page([{ ...mockWalkthrough, status: "pending_review" }]);
}

export async function mockSubmitWalkthrough(id: string): Promise<PropertyWalkthrough> {
  return { ...mockWalkthrough, id, status: "pending_review" };
}

export async function mockApproveWalkthrough(id: string): Promise<PropertyWalkthrough> {
  return { ...mockWalkthrough, id, status: "approved" };
}

export async function mockRejectWalkthrough(id: string): Promise<PropertyWalkthrough> {
  return { ...mockWalkthrough, id, status: "rejected", moderation_reason: "Needs clearer video." };
}

export async function mockListAdminInspectionRequests(): Promise<PaginatedInspectionRequests> {
  return page([{ ...mockInspectionRequest, status: "under_review" }]);
}

export async function mockListAdminWalkthroughs(): Promise<PaginatedInspectionWalkthroughs> {
  return page([{ ...mockWalkthrough, status: "pending_review" }]);
}

export async function mockListAdminReports(): Promise<PaginatedInspectionReports> {
  return page([{ ...mockReport, status: "submitted" }]);
}

export async function mockListInspectors(): Promise<InspectorProfile[]> {
  return [mockInspector];
}

export async function mockListInspectorAssignments(): Promise<InspectionAssignment[]> {
  return [
    {
      id: "assignment-demo-1",
      inspection_request: { ...mockInspectionRequest, assigned_inspector: mockInspector.user },
      inspector: mockInspector.user,
      assigned_by: { id: "admin-1", email: "admin@example.com", full_name: "RealityNG Admin" },
      status: "assigned",
      notes: "Initial assignment.",
      decline_reason: "",
      assigned_at: now,
      accepted_at: null,
      declined_at: null,
      created_at: now,
      updated_at: now,
    },
  ];
}

export async function mockGetCustomerInspectionDashboard(): Promise<InspectionDashboard> {
  return {
    stats: [{ label: "My inspections", value: "1" }],
    recent_requests: [mockInspectionRequest],
  };
}

export async function mockGetInspectorInspectionDashboard(): Promise<InspectionDashboard> {
  return {
    stats: [{ label: "Assigned inspections", value: "1" }],
    recent_requests: [{ ...mockInspectionRequest, assigned_inspector: mockInspector.user }],
    pending_assignments: await mockListInspectorAssignments(),
  };
}

export async function mockGetAdminInspectionDashboard(): Promise<AdminInspectionDashboard> {
  return {
    stats: [{ label: "requested", value: "1" }],
    recent_requests: [mockInspectionRequest],
    pending_walkthroughs: [{ ...mockWalkthrough, status: "pending_review" }],
    pending_reports: [{ ...mockReport, status: "submitted" }],
  };
}

export async function mockCreateInspectionReport(): Promise<InspectionReport> {
  return { ...mockReport, status: "draft" };
}

export async function mockUploadInspectionEvidence(): Promise<InspectionEvidence> {
  return {
    id: `evidence-${Date.now()}`,
    evidence_type: "photo",
    signed_url: "",
    mime_type: "image/jpeg",
    file_size: 2048,
    caption: "Synthetic evidence",
    category: "interior",
    captured_at: null,
    display_order: 1,
    visibility: "requester_visible",
    uploaded_by: mockInspector.user,
    created_at: now,
    updated_at: now,
  };
}
