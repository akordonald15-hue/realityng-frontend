import { Badge } from "@/components/ui/badge";
import type {
  ConstructionMilestoneStatus,
  ConstructionProjectStatus,
  ProgressUpdateStatus,
} from "@/lib/api/construction";

const toneByStatus: Record<string, "gold" | "green" | "muted"> = {
  active: "green",
  completed: "green",
  approved: "green",
  submitted: "gold",
  awaiting_inspection: "gold",
  blocked: "gold",
  rejected: "muted",
  cancelled: "muted",
  archived: "muted",
  draft: "muted",
  planned: "gold",
  in_progress: "gold",
  paused: "gold",
  on_hold: "gold",
};

export function ConstructionStatusBadge({
  status,
}: {
  status: ConstructionProjectStatus | ConstructionMilestoneStatus | ProgressUpdateStatus;
}) {
  return <Badge variant={toneByStatus[status] ?? "gold"}>{status.replaceAll("_", " ")}</Badge>;
}
