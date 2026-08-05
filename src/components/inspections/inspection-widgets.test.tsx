import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InspectionStatusBadge } from "@/components/inspections/inspection-status-badge";
import { InspectionTimeline, WalkthroughVideoPlayer } from "@/components/inspections/inspection-widgets";

describe("inspection UI widgets", () => {
  it("renders human-readable inspection statuses", () => {
    render(<InspectionStatusBadge status="needs_more_information" />);

    expect(screen.getByText("needs more information")).toBeInTheDocument();
  });

  it("renders timeline events with actor context", () => {
    render(
      <InspectionTimeline
        events={[
          {
            id: "event-1",
            event_type: "InspectionRequested",
            description: "Inspection request submitted.",
            actor_label: "RealityNG operations",
            metadata: {},
            created_at: "2026-08-05T10:00:00Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("Inspection request submitted.")).toBeInTheDocument();
    expect(screen.getByText(/RealityNG operations/)).toBeInTheDocument();
  });

  it("shows a safe empty state when no public walkthrough is approved", () => {
    render(<WalkthroughVideoPlayer walkthroughs={[]} />);

    expect(screen.getByText("Virtual walkthroughs")).toBeInTheDocument();
    expect(screen.getByText(/No moderated walkthrough video/)).toBeInTheDocument();
  });
});
