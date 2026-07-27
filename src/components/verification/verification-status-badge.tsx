import { Badge } from "@/components/ui/badge";

export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "under_review"
  | "needs_more_information"
  | "approved"
  | "rejected"
  | "expired"
  | "suspended";

type VerificationStatusBadgeProps = {
  status: VerificationStatus;
  children?: boolean;
};

const positiveStatuses = new Set<VerificationStatus>(["approved"]);

const pendingStatuses = new Set<VerificationStatus>([
  "pending",
  "under_review",
  "needs_more_information",
]);

const closedStatuses = new Set<VerificationStatus>([
  "not_submitted",
  "rejected",
  "expired",
  "suspended",
]);

function labelFor(status: VerificationStatus) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function VerificationStatusBadge({
  status,
  children = true,
}: VerificationStatusBadgeProps) {
  const variant = positiveStatuses.has(status)
    ? "green"
    : pendingStatuses.has(status)
    ? "gold"
    : closedStatuses.has(status)
    ? "muted"
    : "muted";

  return <Badge variant={variant}>{children ? labelFor(status) : null}</Badge>;
}
