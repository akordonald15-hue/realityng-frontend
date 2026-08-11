import type {
  ConstructionDashboard,
  ConstructionProject,
  Paginated,
} from "@/lib/api/construction";

const now = new Date().toISOString();

export const mockConstructionProject: ConstructionProject = {
  id: "construction-demo-1",
  property: {
    id: "property-demo-1",
    title: "Lekki duplex development",
    slug: "lekki-duplex-development",
    location: "Lekki, Lagos",
    city: "Lekki",
    state: "Lagos",
  },
  name: "Diaspora Duplex Build",
  slug: "diaspora-duplex-build",
  description: "Remote construction tracking for a diaspora-owned duplex project.",
  project_type: "new_build",
  status: "active",
  visibility: "stakeholders",
  planned_start_date: "2026-08-01",
  planned_end_date: "2026-12-20",
  actual_start_date: "2026-08-03",
  actual_end_date: null,
  overall_progress: "42.50",
  owner: { id: "owner-1", email: "owner@example.com", full_name: "Property Owner" },
  created_by: { id: "owner-1", email: "owner@example.com", full_name: "Property Owner" },
  project_manager: {
    id: "pm-1",
    email: "pm@example.com",
    full_name: "Assigned Project Manager",
  },
  contractor_name_or_reference: "On-site contractor",
  estimated_duration_days: 150,
  milestones: [
    {
      id: "milestone-1",
      name: "Site preparation",
      description: "Clearing, access, and site readiness.",
      sequence: 1,
      weight: "10.00",
      status: "completed",
      progress_percent: "100.00",
      requires_inspection: false,
      blocking: false,
      inspection_count: 0,
    },
    {
      id: "milestone-2",
      name: "Foundation",
      description: "Foundation works and inspection gate.",
      sequence: 2,
      weight: "25.00",
      status: "awaiting_inspection",
      progress_percent: "100.00",
      requires_inspection: true,
      blocking: true,
      inspection_count: 1,
    },
    {
      id: "milestone-3",
      name: "Structural frame",
      description: "Columns, beams, and upper floor structure.",
      sequence: 3,
      weight: "25.00",
      status: "in_progress",
      progress_percent: "30.00",
      requires_inspection: true,
      blocking: false,
      inspection_count: 0,
    },
  ],
  stakeholders: [
    {
      id: "stakeholder-1",
      user: "investor-1",
      user_email: "investor@example.com",
      stakeholder_role: "investor",
      access_level: "read_only",
      status: "active",
    },
  ],
  created_at: now,
  updated_at: now,
};

const dashboard: ConstructionDashboard = {
  stats: [
    { label: "Projects", value: "1" },
    { label: "Active", value: "1" },
    { label: "Delayed", value: "0" },
    { label: "Pending updates", value: "1" },
  ],
  projects: [mockConstructionProject],
  delayed_projects: [],
  pending_updates: [
    {
      id: "update-1",
      milestone: "milestone-3",
      title: "Frame work started",
      summary: "Column reinforcement started on the first floor.",
      current_progress: "30.00",
      status: "submitted",
      created_at: now,
    },
  ],
  activity: [
    {
      id: "event-1",
      event_type: "ConstructionProgressSubmitted",
      actor_label: "Assigned Project Manager",
      description: "Progress update submitted for structural frame.",
      metadata: {},
      is_internal: false,
      created_at: now,
    },
  ],
};

export async function mockListConstructionProjects(): Promise<Paginated<ConstructionProject>> {
  return { count: 1, next: null, previous: null, results: [mockConstructionProject] };
}

export async function mockGetConstructionProject(slug: string): Promise<ConstructionProject> {
  return { ...mockConstructionProject, slug };
}

export async function mockGetOwnerConstructionDashboard(): Promise<ConstructionDashboard> {
  return dashboard;
}

export async function mockGetOperationsConstructionDashboard(): Promise<ConstructionDashboard> {
  return dashboard;
}

export async function mockGetAdminConstructionDashboard(): Promise<ConstructionDashboard> {
  return dashboard;
}
