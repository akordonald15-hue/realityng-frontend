import { Badge } from "@/components/ui/badge";
import type { ProviderStatus } from "@/lib/api/services";

const labels: Record<ProviderStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Active",
  needs_more_information: "Needs info",
  rejected: "Rejected",
  suspended: "Suspended",
  inactive: "Inactive",
  archived: "Archived",
};

export function formatProviderStatus(status?: ProviderStatus) {
  return status ? labels[status] : "Public";
}

export function ProviderStatusBadge({ status }: { status?: ProviderStatus }) {
  const variant = status === "active" ? "green" : status === "draft" ? "muted" : "gold";
  return <Badge variant={variant}>{formatProviderStatus(status)}</Badge>;
}
