import { Badge } from "@/components/ui/badge";
import type { ServiceReviewStatus } from "@/lib/api/services";

const labels: Record<ServiceReviewStatus, string> = {
  pending: "Pending",
  published: "Published",
  flagged: "Flagged",
  hidden: "Hidden",
  disputed: "Disputed",
  removed: "Removed",
};

export function ReviewStatusBadge({ status }: { status: ServiceReviewStatus }) {
  const variant = status === "published" ? "green" : status === "pending" ? "gold" : "muted";
  return <Badge variant={variant}>{labels[status]}</Badge>;
}
