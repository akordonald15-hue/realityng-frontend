import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type WorkflowStatusBadgeProps = {
  status: string;
  children?: ReactNode;
};

const positiveStatuses = new Set(["approved", "converted", "completed", "confirmed"]);
const cautionStatuses = new Set([
  "submitted",
  "under_review",
  "requested",
  "rescheduled",
  "new",
  "contacted",
  "viewing_scheduled",
]);
const closedStatuses = new Set(["rejected", "withdrawn", "closed", "cancelled"]);

function labelFor(status: string) {
  return status
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function WorkflowStatusBadge({ status, children }: WorkflowStatusBadgeProps) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : cautionStatuses.has(status)
      ? "muted"
      : closedStatuses.has(status)
        ? "muted"
        : "muted";

  return <Badge variant={variant}>{children ?? labelFor(status)}</Badge>;
}
