"use client";

import { AppealList, ComplaintCard } from "@/components/services/governance-widgets";
import { Card } from "@/components/ui/card";
import type { ProviderAppeal, ServiceComplaint } from "@/lib/api/services";

export function ComplaintDetail({ complaint }: { complaint: ServiceComplaint }) {
  return (
    <div className="space-y-5">
      <ComplaintCard complaint={complaint} />
      <Card className="p-5">
        <h2 className="font-heading text-2xl font-semibold text-brand-text">
          Moderation timeline
        </h2>
        <dl className="mt-4 grid gap-3 text-sm text-brand-muted md:grid-cols-2">
          <div>
            <dt className="font-semibold text-brand-text">Status</dt>
            <dd>{complaint.status.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Assigned admin</dt>
            <dd>{complaint.assigned_admin_email || "Not assigned"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Resolved</dt>
            <dd>
              {complaint.resolved_at
                ? new Date(complaint.resolved_at).toLocaleDateString("en-NG")
                : "Not resolved"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Escalated</dt>
            <dd>
              {complaint.escalated_at
                ? new Date(complaint.escalated_at).toLocaleDateString("en-NG")
                : "Not escalated"}
            </dd>
          </div>
        </dl>
        {complaint.resolution_notes ? (
          <p className="mt-4 rounded-md bg-white/5 p-4 text-sm text-brand-muted">
            {complaint.resolution_notes}
          </p>
        ) : null}
      </Card>
      <Card className="p-5">
        <h2 className="font-heading text-2xl font-semibold text-brand-text">Evidence</h2>
        {complaint.evidence?.length ? (
          <ul className="mt-4 space-y-2 text-sm text-brand-muted">
            {complaint.evidence.map((item) => (
              <li key={item.id}>{item.caption || "Evidence file"}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-brand-muted">No evidence files attached yet.</p>
        )}
      </Card>
    </div>
  );
}

export function AppealDetail({ appeal }: { appeal: ProviderAppeal }) {
  return (
    <div className="space-y-5">
      <AppealList appeals={[appeal]} />
      <Card className="p-5">
        <h2 className="font-heading text-2xl font-semibold text-brand-text">Decision details</h2>
        <dl className="mt-4 grid gap-3 text-sm text-brand-muted md:grid-cols-2">
          <div>
            <dt className="font-semibold text-brand-text">Status</dt>
            <dd>{appeal.status.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Decided by</dt>
            <dd>{appeal.decided_by_email || "Pending admin decision"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Decision date</dt>
            <dd>
              {appeal.decided_at
                ? new Date(appeal.decided_at).toLocaleDateString("en-NG")
                : "Pending"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-brand-text">Provider</dt>
            <dd>{appeal.provider.business_name}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
