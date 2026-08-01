import { Badge } from "@/components/ui/badge";
import type { QuoteRequestStatus } from "@/lib/api/services";

const labels: Record<QuoteRequestStatus, string> = {
  submitted: "Submitted",
  viewed: "Viewed",
  responded: "Responded",
  closed: "Closed",
  cancelled: "Cancelled",
};

export function formatQuoteRequestStatus(status: QuoteRequestStatus) {
  return labels[status];
}

export function QuoteRequestStatusBadge({ status }: { status: QuoteRequestStatus }) {
  const variant = status === "closed" || status === "cancelled" ? "muted" : "gold";
  return <Badge variant={status === "responded" ? "green" : variant}>{labels[status]}</Badge>;
}
