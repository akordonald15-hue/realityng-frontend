import type {
  InspectionReportStatus,
  InspectionRequestStatus,
  WalkthroughStatus,
} from "@/lib/api/inspections";

const toneByStatus: Record<string, string> = {
  approved: "border-emerald-700/25 bg-emerald-50 text-emerald-800",
  completed: "border-emerald-700/25 bg-emerald-50 text-emerald-800",
  requested: "border-reality-brand-700/25 bg-reality-surfaceBrand text-reality-brandEmphasis",
  pending_review: "border-reality-brand-700/25 bg-reality-surfaceBrand text-reality-brandEmphasis",
  submitted: "border-reality-brand-700/25 bg-reality-surfaceBrand text-reality-brandEmphasis",
  scheduled: "border-sky-700/25 bg-sky-50 text-sky-800",
  assigned: "border-sky-700/25 bg-sky-50 text-sky-800",
  in_progress: "border-sky-700/25 bg-sky-50 text-sky-800",
  needs_more_information: "border-amber-700/25 bg-amber-50 text-amber-900",
  needs_revision: "border-amber-700/25 bg-amber-50 text-amber-900",
  rejected: "border-red-700/25 bg-red-50 text-red-800",
  cancelled: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
  hidden: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
  archived: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
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
        toneByStatus[status] ?? "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary"
      }`}
    >
      {label(status)}
    </span>
  );
}
