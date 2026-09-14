"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FormMessage } from "@/components/forms/form-message";
import {
  InspectionReportCard,
  InspectionTimeline,
} from "@/components/inspections/inspection-widgets";
import { InspectionStatusBadge } from "@/components/inspections/inspection-status-badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  cancelInspectionRequest,
  getInspectionReportForRequest,
  getInspectionRequest,
  listInspectionTimeline,
} from "@/lib/api/inspections";

export default function InspectionDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const requestQuery = useQuery({
    queryKey: ["inspection-request", params.id],
    queryFn: () => getInspectionRequest(params.id),
  });
  const timelineQuery = useQuery({
    queryKey: ["inspection-timeline", params.id],
    queryFn: () => listInspectionTimeline(params.id),
  });
  const reportQuery = useQuery({
    queryKey: ["inspection-report", params.id],
    queryFn: () => getInspectionReportForRequest(params.id),
    retry: false,
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelInspectionRequest(params.id, "Cancelled from customer dashboard."),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspection-request", params.id] }),
  });
  const request = requestQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Inspection detail"
          title={request?.property.title ?? "Inspection request"}
          description="Review status, private report availability, and every visible step in the inspection timeline."
        />
        <Link className={buttonClasses("realitySecondary")} href="/dashboard/inspections">
          Back to inspections
        </Link>
      </div>

      {requestQuery.isLoading ? (
        <Card className="mt-8 p-5 text-reality-text-secondary">Loading inspection...</Card>
      ) : null}
      {request ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Card className="p-5">
              <InspectionStatusBadge status={request.status} />
              <h1 className="mt-4 font-display text-3xl font-semibold text-reality-text-primary">
                {request.purpose}
              </h1>
              <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{request.description}</p>
              {request.rejection_reason ? (
                <FormMessage tone="error">{request.rejection_reason}</FormMessage>
              ) : null}
            </Card>

            {reportQuery.data ? (
              <>
                <InspectionReportCard report={reportQuery.data} />
              </>
            ) : reportQuery.isError ? (
              <Card className="p-5 text-sm text-reality-text-secondary">
                No approved report is available yet.
              </Card>
            ) : null}

            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">Timeline</h2>
              <div className="mt-5">
                <InspectionTimeline events={timelineQuery.data ?? []} />
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">Schedule</h2>
              <dl className="mt-4 space-y-3 text-sm text-reality-text-secondary">
                <div>
                  <dt className="font-semibold text-reality-text-primary">Preferred date</dt>
                  <dd>{request.preferred_date}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-reality-text-primary">Scheduled for</dt>
                  <dd>{request.scheduled_for ?? "Not scheduled yet"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-reality-text-primary">Inspector</dt>
                  <dd>{request.assigned_inspector?.full_name ?? "Not assigned yet"}</dd>
                </div>
              </dl>
            </Card>
            {["requested", "under_review", "needs_more_information"].includes(request.status) ? (
              <Card className="p-5">
                <h2 className="font-display text-2xl font-semibold text-reality-text-primary">Actions</h2>
                {cancelMutation.isError ? (
                  <FormMessage tone="error">{getApiErrorMessage(cancelMutation.error)}</FormMessage>
                ) : null}
                <Button
                  className="mt-4"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                  variant="secondary"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel request"}
                </Button>
              </Card>
            ) : null}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
