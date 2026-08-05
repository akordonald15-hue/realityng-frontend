import type {
  InspectionReportStatus,
  InspectionRequestStatus,
  WalkthroughStatus,
} from "@/lib/api/inspections";

const toneByStatus: Record<string, string> = {
  approved: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  completed: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  requested: "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary",
  pending_review: "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary",
  submitted: "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary",
  scheduled: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  assigned: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  in_progress: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  needs_more_information: "border-orange-300/30 bg-orange-300/10 text-orange-100",
  needs_revision: "border-orange-300/30 bg-orange-300/10 text-orange-100",
  rejected: "border-red-300/30 bg-red-300/10 text-red-100",
  cancelled: "border-white/10 bg-white/5 text-brand-muted",
  hidden: "border-white/10 bg-white/5 text-brand-muted",
  archived: "border-white/10 bg-white/5 text-brand-muted",
};

function label(status: string) {
  return status.replaceAll("_", " ");
}

export function InspectionStatusBadge({
  status,
}: {
  status: InspectionRequestStatus | InspectionReportStatus | WalkthroughStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        toneByStatus[status] ?? "border-white/10 bg-white/5 text-brand-muted"
      }`}
    >
      {label(status)}
    </span>
  );
}
