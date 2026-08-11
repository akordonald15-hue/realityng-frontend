import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockGetAdminConstructionDashboard,
  mockGetConstructionProject,
  mockGetOperationsConstructionDashboard,
  mockGetOwnerConstructionDashboard,
  mockListConstructionProjects,
} from "@/mocks/mock-construction";

type UserSummary = {
  id: string;
  email: string;
  full_name: string;
};

export type PropertySummary = {
  id: string;
  title: string;
  slug?: string;
  location?: string;
  city?: string;
  state?: string;
};

export type ConstructionProjectStatus =
  | "draft"
  | "planned"
  | "active"
  | "paused"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

export type ConstructionMilestoneStatus =
  | "not_started"
  | "ready"
  | "in_progress"
  | "blocked"
  | "awaiting_inspection"
  | "completed"
  | "skipped"
  | "cancelled";

export type ProgressUpdateStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "revision_requested"
  | "archived";

export type ConstructionMilestone = {
  id: string;
  name: string;
  description: string;
  sequence: number;
  weight: string;
  status: ConstructionMilestoneStatus;
  progress_percent: string;
  requires_inspection: boolean;
  blocking: boolean;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  inspection_count?: number;
};

export type ProjectStakeholder = {
  id: string;
  user: string;
  user_email: string;
  stakeholder_role: "owner" | "investor" | "project_manager" | "contractor" | "inspector" | "viewer";
  access_level: "read_only" | "commenter" | "operator" | "manager" | "owner";
  status: "invited" | "active" | "declined" | "revoked" | "expired";
};

export type ConstructionEvidence = {
  id: string;
  milestone?: string | null;
  progress_update?: string | null;
  evidence_type: "photo" | "video" | "document";
  signed_url: string;
  caption: string;
  captured_at?: string | null;
  file_size: number;
  mime_type: string;
  visibility: string;
  status: "active" | "archived";
  created_at: string;
};

export type ConstructionProgressUpdate = {
  id: string;
  milestone?: string | null;
  submitted_by?: UserSummary;
  title: string;
  summary: string;
  work_completed?: string;
  current_progress: string;
  issues?: string;
  blockers?: string;
  next_steps?: string;
  status: ProgressUpdateStatus;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string;
  evidence?: ConstructionEvidence[];
  created_at: string;
};

export type ConstructionTimelineEvent = {
  id: string;
  event_type: string;
  actor_label: string;
  description: string;
  metadata: Record<string, unknown>;
  is_internal: boolean;
  created_at: string;
};

export type ConstructionProject = {
  id: string;
  property: PropertySummary;
  name: string;
  slug: string;
  description: string;
  project_type: string;
  status: ConstructionProjectStatus;
  visibility: string;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  overall_progress: string;
  owner?: UserSummary;
  created_by?: UserSummary;
  project_manager?: UserSummary | null;
  contractor_name_or_reference?: string;
  estimated_duration_days?: number | null;
  milestones?: ConstructionMilestone[];
  stakeholders?: ProjectStakeholder[];
  created_at: string;
  updated_at?: string;
};

export type ConstructionDashboard = {
  stats: { label: string; value: string; detail?: string }[];
  projects: ConstructionProject[];
  delayed_projects: ConstructionProject[];
  pending_updates: ConstructionProgressUpdate[];
  activity: ConstructionTimelineEvent[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export async function listConstructionProjects(): Promise<Paginated<ConstructionProject>> {
  if (USE_MOCKS) return mockListConstructionProjects();
  const response = await apiClient.get<Paginated<ConstructionProject>>("/construction/projects/");
  return response.data;
}

export async function getConstructionProject(slug: string): Promise<ConstructionProject> {
  if (USE_MOCKS) return mockGetConstructionProject(slug);
  const response = await apiClient.get<ConstructionProject>(`/construction/projects/${slug}/`);
  return response.data;
}

export async function getOwnerConstructionDashboard(): Promise<ConstructionDashboard> {
  if (USE_MOCKS) return mockGetOwnerConstructionDashboard();
  const response = await apiClient.get<ConstructionDashboard>("/construction/dashboard/owner/");
  return response.data;
}

export async function getOperationsConstructionDashboard(): Promise<ConstructionDashboard> {
  if (USE_MOCKS) return mockGetOperationsConstructionDashboard();
  const response = await apiClient.get<ConstructionDashboard>(
    "/construction/dashboard/operations/",
  );
  return response.data;
}

export async function getAdminConstructionDashboard(): Promise<ConstructionDashboard> {
  if (USE_MOCKS) return mockGetAdminConstructionDashboard();
  const response = await apiClient.get<ConstructionDashboard>("/construction/dashboard/admin/");
  return response.data;
}

export async function listConstructionTimeline(
  slug: string,
): Promise<ConstructionTimelineEvent[]> {
  if (USE_MOCKS) return mockGetOwnerConstructionDashboard().then((data) => data.activity);
  const response = await apiClient.get<ConstructionTimelineEvent[]>(
    `/construction/projects/${slug}/timeline/`,
  );
  return response.data;
}
