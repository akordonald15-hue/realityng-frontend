import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import type {
  ContactPreference,
  InquiryPropertySummary,
  InquiryType,
  InquiryUser,
} from "@/lib/api/inquiries";

export type LeadPipelineStage =
  | "new"
  | "contacted"
  | "qualified"
  | "viewing_scheduled"
  | "application_started"
  | "application_submitted"
  | "negotiating"
  | "converted"
  | "closed_lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type LeadActivityType =
  | "note"
  | "call"
  | "whatsapp"
  | "email"
  | "follow_up_scheduled"
  | "follow_up_completed"
  | "status_changed"
  | "assigned";

export const leadPipelineStageOptions: { value: LeadPipelineStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "viewing_scheduled", label: "Viewing Scheduled" },
  { value: "application_started", label: "Application Started" },
  { value: "application_submitted", label: "Application Submitted" },
  { value: "negotiating", label: "Negotiating" },
  { value: "converted", label: "Converted" },
  { value: "closed_lost", label: "Closed Lost" },
];

export const leadPriorityOptions: { value: LeadPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function formatLeadPipelineStage(stage: LeadPipelineStage): string {
  return leadPipelineStageOptions.find((option) => option.value === stage)?.label ?? stage;
}

export function formatLeadPriority(priority: LeadPriority): string {
  return leadPriorityOptions.find((option) => option.value === priority)?.label ?? priority;
}

export type Lead = {
  id: string;
  property: InquiryPropertySummary;
  interested_user: InquiryUser;
  property_owner: InquiryUser;
  inquiry_type: InquiryType;
  message: string;
  status: string;
  pipeline_stage: LeadPipelineStage;
  priority: LeadPriority;
  assigned_to: InquiryUser | null;
  source: string;
  contact_preference?: ContactPreference;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  follow_up_count: number;
  closed_reason: string;
  conversion_value: string | null;
  converted_at: string | null;
  internal_notes: string;
  created_at: string;
  updated_at: string;
};

export type LeadActivity = {
  id: string;
  inquiry: string;
  actor: InquiryUser | null;
  activity_type: LeadActivityType;
  note: string;
  scheduled_for: string | null;
  completed_at: string | null;
  created_at: string;
};

export type PaginatedLeads = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lead[];
};

export type LeadFilters = {
  pipeline_stage?: LeadPipelineStage;
  priority?: LeadPriority;
  assigned_to?: string;
  property?: string;
  search?: string;
};

export type LeadDashboardSummary = {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  upcoming_follow_ups: number;
  viewing_conversion_rate: number;
  application_conversion_rate: number;
  converted_count: number;
  closed_lost_count: number;
  average_response_seconds: number | null;
};

const EMPTY_PAGINATED_LEADS: PaginatedLeads = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const EMPTY_LEAD_DASHBOARD_SUMMARY: LeadDashboardSummary = {
  total_leads: 0,
  new_leads: 0,
  contacted_leads: 0,
  upcoming_follow_ups: 0,
  viewing_conversion_rate: 0,
  application_conversion_rate: 0,
  converted_count: 0,
  closed_lost_count: 0,
  average_response_seconds: null,
};

export async function listLeads(filters: LeadFilters = {}): Promise<PaginatedLeads> {
  if (USE_MOCKS) {
    return EMPTY_PAGINATED_LEADS;
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const query = params.toString();
  const response = await apiClient.get<PaginatedLeads>(`/leads/${query ? `?${query}` : ""}`);
  return response.data;
}

export async function getLead(leadId: string): Promise<Lead> {
  const response = await apiClient.get<Lead>(`/leads/${leadId}/`);
  return response.data;
}

export async function assignLead({
  leadId,
  assignedToId,
}: {
  leadId: string;
  assignedToId: string | null;
}): Promise<Lead> {
  const response = await apiClient.post<Lead>(`/leads/${leadId}/assign/`, {
    assigned_to_id: assignedToId,
  });
  return response.data;
}

export async function transitionLeadStage({
  leadId,
  pipelineStage,
}: {
  leadId: string;
  pipelineStage: LeadPipelineStage;
}): Promise<Lead> {
  const response = await apiClient.post<Lead>(`/leads/${leadId}/transition/`, {
    pipeline_stage: pipelineStage,
  });
  return response.data;
}

export async function listLeadActivities(leadId: string): Promise<LeadActivity[]> {
  const response = await apiClient.get<LeadActivity[]>(`/leads/${leadId}/activities/`);
  return response.data;
}

export async function logLeadActivity({
  leadId,
  activityType,
  note,
  scheduledFor,
  completedAt,
}: {
  leadId: string;
  activityType: LeadActivityType;
  note?: string;
  scheduledFor?: string;
  completedAt?: string;
}): Promise<LeadActivity> {
  const response = await apiClient.post<LeadActivity>(`/leads/${leadId}/log-activity/`, {
    activity_type: activityType,
    note,
    scheduled_for: scheduledFor,
    completed_at: completedAt,
  });
  return response.data;
}

export async function getLeadDashboardSummary(): Promise<LeadDashboardSummary> {
  if (USE_MOCKS) {
    return EMPTY_LEAD_DASHBOARD_SUMMARY;
  }
  const response = await apiClient.get<LeadDashboardSummary>("/dashboard/leads/summary/");
  return response.data;
}
