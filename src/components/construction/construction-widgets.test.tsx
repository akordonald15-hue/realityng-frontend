import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConstructionDashboardBody } from "@/components/construction/construction-widgets";
import { mockConstructionProject } from "@/mocks/mock-construction";

describe("construction dashboard widgets", () => {
  it("renders projects, progress, milestones, and pending updates", () => {
    render(
      <ConstructionDashboardBody
        baseHref="/dashboard/construction"
        dashboard={{
          stats: [{ label: "Projects", value: "1" }],
          projects: [mockConstructionProject],
          delayed_projects: [],
          pending_updates: [
            {
              id: "update-1",
              title: "Foundation checked",
              summary: "Inspection gate is waiting.",
              current_progress: "100.00",
              status: "submitted",
              created_at: "2026-08-11T10:00:00Z",
            },
          ],
          activity: [
            {
              id: "event-1",
              event_type: "ConstructionProgressSubmitted",
              actor_label: "Project manager",
              description: "Progress update submitted.",
              metadata: {},
              is_internal: false,
              created_at: "2026-08-11T10:00:00Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Diaspora Duplex Build")).toBeInTheDocument();
    expect(screen.getByText("42.5%")).toBeInTheDocument();
    expect(screen.getByText("Foundation checked")).toBeInTheDocument();
    expect(screen.getByText("Progress update submitted.")).toBeInTheDocument();
  });
});
