import { describe, expect, it, vi } from "vitest";

import {
  getLead,
  getLeadDashboardSummary,
  listLeadActivities,
  listLeads,
  logLeadActivity,
  transitionLeadStage,
} from "@/lib/api/leads";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/demo-mode", () => ({
  USE_MOCKS: false,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: mocks.get,
    post: mocks.post,
  },
}));

describe("lead API client", () => {
  it("uses the integrated backend lead endpoints", async () => {
    mocks.get.mockResolvedValue({ data: { count: 0, next: null, previous: null, results: [] } });
    await listLeads({ pipeline_stage: "new", priority: "high", search: "Ikoyi" });
    expect(mocks.get).toHaveBeenCalledWith("/leads/?pipeline_stage=new&priority=high&search=Ikoyi");

    mocks.get.mockResolvedValue({ data: { id: "lead-1" } });
    await getLead("lead-1");
    expect(mocks.get).toHaveBeenCalledWith("/leads/lead-1/");

    mocks.get.mockResolvedValue({ data: [] });
    await listLeadActivities("lead-1");
    expect(mocks.get).toHaveBeenCalledWith("/leads/lead-1/activities/");

    mocks.get.mockResolvedValue({ data: { total_leads: 0 } });
    await getLeadDashboardSummary();
    expect(mocks.get).toHaveBeenCalledWith("/dashboard/leads/summary/");
  });

  it("uses explicit transition and activity mutation endpoints", async () => {
    mocks.post.mockResolvedValue({ data: { id: "lead-1" } });

    await transitionLeadStage({ leadId: "lead-1", pipelineStage: "contacted" });
    expect(mocks.post).toHaveBeenCalledWith("/leads/lead-1/transition/", {
      pipeline_stage: "contacted",
    });

    await logLeadActivity({
      leadId: "lead-1",
      activityType: "note",
      note: "Called buyer.",
    });
    expect(mocks.post).toHaveBeenCalledWith("/leads/lead-1/log-activity/", {
      activity_type: "note",
      note: "Called buyer.",
      scheduled_for: undefined,
      completed_at: undefined,
    });
  });
});
