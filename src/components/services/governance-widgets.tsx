"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  ProviderAppeal,
  ProviderAppealPayload,
  ServiceComplaint,
  ServiceComplaintStatus,
} from "@/lib/api/services";

const complaintTone: Record<ServiceComplaintStatus, string> = {
  open: "bg-amber-500/15 text-amber-200",
  under_review: "bg-sky-500/15 text-sky-200",
  awaiting_customer: "bg-purple-500/15 text-purple-200",
  awaiting_provider: "bg-purple-500/15 text-purple-200",
  resolved: "bg-emerald-500/15 text-emerald-200",
  rejected: "bg-red-500/15 text-red-200",
  escalated: "bg-orange-500/15 text-orange-200",
  closed: "bg-white/10 text-brand-muted",
};

export function ComplaintStatusBadge({ status }: { status: ServiceComplaintStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${complaintTone[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function ComplaintCard({
  complaint,
  href,
}: {
  complaint: ServiceComplaint;
  href?: string;
}) {
  const content = (
    <Card className="p-5 transition hover:border-brand-secondary/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ComplaintStatusBadge status={complaint.status} />
          <h2 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
            {complaint.subject}
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">{complaint.description}</p>
        </div>
        <div className="text-right text-sm text-brand-muted">
          <p>{new Date(complaint.created_at).toLocaleDateString("en-NG")}</p>
          <p>{complaint.category.replaceAll("_", " ")}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-brand-muted">
        Provider: {complaint.provider.business_name}
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

export function SuspensionBanner({
  reason,
  type,
  expiresAt,
}: {
  reason?: string;
  type?: string;
  expiresAt?: string | null;
}) {
  if (!reason && !type) return null;
  return (
    <Card className="border-red-400/30 bg-red-500/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">
        Provider governance restriction
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-text">
        Your profile is currently suspended
      </h2>
      <p className="mt-2 text-sm leading-6 text-brand-muted">
        {reason || "Contact RealityNG support or submit an appeal for review."}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-red-100">
        {(type || "suspension").replaceAll("_", " ")}
        {expiresAt ? ` until ${new Date(expiresAt).toLocaleDateString("en-NG")}` : ""}
      </p>
    </Card>
  );
}

export function AppealForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (payload: ProviderAppealPayload) => void;
  isPending?: boolean;
}) {
  const [appealType, setAppealType] = useState<ProviderAppealPayload["appeal_type"]>("suspension");
  const [reason, setReason] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ appeal_type: appealType, reason });
      }}
    >
      <label className="block text-sm font-semibold text-brand-text">
        Appeal type
        <select
          className="mt-2 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
          onChange={(event) => setAppealType(event.target.value as ProviderAppealPayload["appeal_type"])}
          value={appealType}
        >
          <option value="suspension">Suspension appeal</option>
          <option value="warning">Warning appeal</option>
        </select>
      </label>
      <label className="block text-sm font-semibold text-brand-text">
        Appeal reason
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-white/10 bg-brand-primary px-3 py-2 text-brand-text"
          onChange={(event) => setReason(event.target.value)}
          required
          value={reason}
        />
      </label>
      <Button disabled={isPending || reason.trim().length < 10} type="submit">
        Submit appeal
      </Button>
    </form>
  );
}

export function AppealList({
  appeals,
  getHref,
}: {
  appeals: ProviderAppeal[];
  getHref?: (appeal: ProviderAppeal) => string;
}) {
  if (!appeals.length) {
    return (
      <Card className="p-5 text-sm text-brand-muted">
        Appeals submitted to RealityNG operations will appear here.
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {appeals.map((appeal) => {
        const content = (
          <Card className="p-5 transition hover:border-brand-secondary/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-text">
                  {appeal.appeal_type.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm leading-6 text-brand-muted">{appeal.reason}</p>
              </div>
              <span className="rounded-full bg-brand-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                {appeal.status.replaceAll("_", " ")}
              </span>
            </div>
            {appeal.admin_notes ? (
              <p className="mt-3 rounded-md bg-white/5 p-3 text-sm text-brand-muted">
                {appeal.admin_notes}
              </p>
            ) : null}
          </Card>
        );
        const href = getHref?.(appeal);
        return href ? (
          <Link className="block" href={href} key={appeal.id}>
            {content}
          </Link>
        ) : (
          <div key={appeal.id}>{content}</div>
        );
      })}
    </div>
  );
}
