import { Badge } from "@/components/ui/badge";
import type { EscrowStatus } from "@/lib/api/payments";

const positiveStatuses = new Set<EscrowStatus>(["funded", "released", "refunded"]);
const pendingStatuses = new Set<EscrowStatus>([
  "awaiting_provider",
  "awaiting_funding",
  "partially_funded",
  "conditions_pending",
  "release_pending",
  "refund_pending",
]);

function labelFor(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EscrowStatusBadge({ status }: { status: EscrowStatus }) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : pendingStatuses.has(status)
      ? "gold"
      : "muted";

  return <Badge variant={variant}>{labelFor(status)}</Badge>;
}

export function EscrowSimpleStatusBadge({ status }: { status: string }) {
  return <Badge variant={status.includes("confirmed") ? "green" : "muted"}>{labelFor(status)}</Badge>;
}
