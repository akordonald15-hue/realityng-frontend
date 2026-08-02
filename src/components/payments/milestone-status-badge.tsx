import { Badge } from "@/components/ui/badge";
import type { PaymentMilestone } from "@/lib/api/payments";

type MilestoneStatus = PaymentMilestone["status"];

const positiveStatuses = new Set<MilestoneStatus>(["accepted"]);

const pendingStatuses = new Set<MilestoneStatus>([
  "pending",
  "proof_uploaded",
  "under_review",
]);

const closedStatuses = new Set<MilestoneStatus>([
  "rejected",
  "disputed",
  "cancelled",
]);

function labelFor(status: MilestoneStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type MilestoneStatusBadgeProps = {
  status: MilestoneStatus;
  children?: boolean;
};

export function MilestoneStatusBadge({
  status,
  children = true,
}: MilestoneStatusBadgeProps) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : pendingStatuses.has(status)
    ? "gold"
    : closedStatuses.has(status)
    ? "muted"
    : "muted";

  return <Badge variant={variant}>{children ? labelFor(status) : null}</Badge>;
}
