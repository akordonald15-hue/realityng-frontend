import { Badge } from "@/components/ui/badge";
import type { PaymentDispute } from "@/lib/api/payments";

type DisputeStatus = PaymentDispute["status"];

const positiveStatuses = new Set<DisputeStatus>(["resolved"]);

const pendingStatuses = new Set<DisputeStatus>(["open", "under_review"]);

const closedStatuses = new Set<DisputeStatus>(["closed"]);

function labelFor(status: DisputeStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type DisputeStatusBadgeProps = {
  status: DisputeStatus;
  children?: boolean;
};

export function DisputeStatusBadge({
  status,
  children = true,
}: DisputeStatusBadgeProps) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : pendingStatuses.has(status)
    ? "gold"
    : closedStatuses.has(status)
    ? "muted"
    : "muted";

  return <Badge variant={variant}>{children ? labelFor(status) : null}</Badge>;
}
