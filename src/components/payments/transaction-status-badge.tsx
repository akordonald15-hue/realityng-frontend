import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/api/payments";

type TransactionStatus = Transaction["status"];

const positiveStatuses = new Set<TransactionStatus>(["completed"]);

const pendingStatuses = new Set<TransactionStatus>(["active"]);

const closedStatuses = new Set<TransactionStatus>([
  "draft",
  "cancelled",
  "disputed",
]);

function labelFor(status: TransactionStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
  children?: boolean;
};

export function TransactionStatusBadge({
  status,
  children = true,
}: TransactionStatusBadgeProps) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : pendingStatuses.has(status)
    ? "gold"
    : closedStatuses.has(status)
    ? "muted"
    : "muted";

  return <Badge variant={variant}>{children ? labelFor(status) : null}</Badge>;
}
