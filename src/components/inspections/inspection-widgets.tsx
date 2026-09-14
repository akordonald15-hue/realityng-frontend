"use client";

import Link from "next/link";
import { useState } from "react";

import { InspectionStatusBadge } from "@/components/inspections/inspection-status-badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  InspectionAssignment,
  InspectionEvidence,
  InspectionRequest,
  InspectionReport,
  PropertyWalkthrough,
  TimelineEvent,
} from "@/lib/api/inspections";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function InspectionRequestCard({
  request,
  href,
}: {
  request: InspectionRequest;
  href?: string;
}) {
  const content = (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <InspectionStatusBadge status={request.status} />
          <h2 className="mt-3 font-display text-2xl font-semibold text-reality-text-primary">
            {request.property.title}
          </h2>
          <p className="mt-2 text-sm text-reality-text-secondary">
            {request.inspection_type.replaceAll("_", " ")} · Preferred {formatDate(request.preferred_date)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-reality-text-secondary">
            {request.purpose}
          </p>
        </div>
        {href ? <span className={buttonClasses("realitySecondary")}>Open</span> : null}
      </div>
    </Card>
  );

  return href ? (
    <Link className="block" href={href}>
      {content}
    </Link>
  ) : (
    content
  );
}

export function WalkthroughVideoPlayer({
  walkthroughs,
}: {
  walkthroughs: PropertyWalkthrough[];
}) {
  if (walkthroughs.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
          Virtual walkthroughs
        </h2>
        <p className="mt-3 text-sm leading-6 text-reality-text-secondary">
          No moderated walkthrough video is available for this property yet. Request a viewing or
          inspection for stronger evidence before making a decision.
        </p>
      </Card>
    );
  }

  const featured = walkthroughs.find((item) => item.is_featured) ?? walkthroughs[0];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
            Moderated media
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-reality-text-primary">
            Virtual walkthrough
          </h2>
        </div>
        <span className="text-sm font-semibold text-reality-text-secondary">
          {walkthroughs.length} approved video{walkthroughs.length === 1 ? "" : "s"}
        </span>
      </div>
      <Card className="mt-5 overflow-hidden">
        <video
          className="aspect-video w-full bg-black"
          controls
          poster={featured.thumbnail_url || undefined}
          preload="metadata"
          src={featured.video_url}
        />
        <div className="p-5">
          <h3 className="font-display text-2xl font-semibold text-reality-text-primary">
            {featured.title}
          </h3>
          {featured.description ? (
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">{featured.description}</p>
          ) : null}
          <p className="mt-3 text-xs uppercase tracking-wide text-reality-text-secondary">
            Public only after RealityNG moderation
          </p>
        </div>
      </Card>
    </section>
  );
}

export function InspectionTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <Card className="p-5 text-sm text-reality-text-secondary">No timeline events yet.</Card>;
  }
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-4" key={event.id}>
          <p className="font-semibold text-reality-text-primary">{event.description || event.event_type}</p>
          <p className="mt-1 text-sm text-reality-text-secondary">
            {event.actor_label} · {formatDate(event.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function EvidenceList({ evidence }: { evidence: InspectionEvidence[] }) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-reality-border-secondary bg-reality-bg-subtle p-4 text-sm text-reality-text-secondary">
        No private evidence has been attached yet.
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {evidence.map((item) => (
        <Card className="p-4" key={item.id}>
          <InspectionStatusBadge status="approved" />
          <p className="mt-3 font-semibold text-reality-text-primary">
            {item.caption || item.category.replaceAll("_", " ")}
          </p>
          <p className="mt-1 text-sm text-reality-text-secondary">
            {item.evidence_type} · {(item.file_size / 1024).toFixed(1)} KB
          </p>
          {item.signed_url ? (
            <a
              className={buttonClasses("realitySecondary", "mt-4 w-fit")}
              href={item.signed_url}
              rel="noreferrer"
              target="_blank"
            >
              Open signed evidence
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

export function InspectionReportCard({ report }: { report: InspectionReport }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <InspectionStatusBadge status={report.status} />
          <h2 className="mt-3 font-display text-2xl font-semibold text-reality-text-primary">
            Inspection report
          </h2>
          <p className="mt-2 text-sm leading-6 text-reality-text-secondary">{report.summary}</p>
        </div>
        {report.report_document_signed_url ? (
          <a
            className={buttonClasses("realitySecondary")}
            href={report.report_document_signed_url}
            rel="noreferrer"
            target="_blank"
          >
            Open report
          </a>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-reality-text-secondary">Condition</p>
          <p className="mt-1 font-semibold text-reality-text-primary">
            {report.overall_condition.replaceAll("_", " ")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-reality-text-secondary">Risk</p>
          <p className="mt-1 font-semibold text-reality-text-primary">
            {report.risk_level.replaceAll("_", " ")}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-reality-text-secondary">Evidence</p>
          <p className="mt-1 font-semibold text-reality-text-primary">{report.evidence.length}</p>
        </div>
      </div>
    </Card>
  );
}

export function AssignmentCard({
  assignment,
  onAccept,
  onDecline,
  pending,
}: {
  assignment: InspectionAssignment;
  onAccept?: () => void;
  onDecline?: (reason: string) => void;
  pending?: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <InspectionStatusBadge status={assignment.inspection_request.status} />
          <h2 className="mt-3 font-display text-2xl font-semibold text-reality-text-primary">
            {assignment.inspection_request.property.title}
          </h2>
          <p className="mt-2 text-sm text-reality-text-secondary">
            Assignment status: {assignment.status.replaceAll("_", " ")}
          </p>
        </div>
        <Link
          className={buttonClasses("realitySecondary")}
          href={`/dashboard/inspector/assignments/${assignment.inspection_request.id}`}
        >
          Open
        </Link>
      </div>
      {onAccept || onDecline ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {onAccept ? (
            <Button disabled={pending} onClick={onAccept}>
              Accept
            </Button>
          ) : null}
          {onDecline ? (
            <>
              <input
                className="h-11 flex-1 rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 text-sm text-reality-text-primary"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Decline reason"
                value={reason}
              />
              <Button disabled={pending || !reason.trim()} onClick={() => onDecline(reason)} variant="secondary">
                Decline
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

export function WalkthroughModerationCard({
  walkthrough,
  onApprove,
  onReject,
  pending,
}: {
  walkthrough: PropertyWalkthrough;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  pending?: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {walkthrough.status ? <InspectionStatusBadge status={walkthrough.status} /> : null}
          <h2 className="mt-3 font-display text-2xl font-semibold text-reality-text-primary">
            {walkthrough.title}
          </h2>
          <p className="mt-2 text-sm text-reality-text-secondary">
            {walkthrough.property?.title ?? "Property walkthrough"}
          </p>
        </div>
        {walkthrough.video_url ? (
          <a className={buttonClasses("realitySecondary")} href={walkthrough.video_url} rel="noreferrer" target="_blank">
            Preview video
          </a>
        ) : null}
      </div>
      {onApprove || onReject ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr_auto]">
          {onApprove ? (
            <Button disabled={pending} onClick={onApprove}>
              Approve
            </Button>
          ) : null}
          <input
            className="h-11 rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 text-sm text-reality-text-primary"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Rejection reason"
            value={reason}
          />
          {onReject ? (
            <Button disabled={pending || !reason.trim()} onClick={() => onReject(reason)} variant="secondary">
              Reject
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

