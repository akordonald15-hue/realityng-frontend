"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { InspectionReportCard } from "@/components/inspections/inspection-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import {
  adminApproveReport,
  adminListReports,
  adminRequestReportRevision,
  type InspectionReportStatus,
} from "@/lib/api/inspections";

export default function AdminInspectionReportsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<InspectionReportStatus | "">("submitted");
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const reportsQuery = useQuery({
    queryKey: ["admin-inspection-reports", status],
    queryFn: () => adminListReports(status || undefined),
  });
  const approveMutation = useMutation({
    mutationFn: adminApproveReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspection-reports"] }),
  });
  const revisionMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRequestReportRevision(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspection-reports"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Inspection report review"
          description="Approve reports only after verifying that private evidence and summary notes match RealityNG standards."
        />
        <Card className="mt-6 p-4">
          <Select onChange={(event) => setStatus(event.target.value as InspectionReportStatus | "")} value={status}>
            <option value="">Any status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="needs_revision">Needs revision</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Card>
        <div className="mt-6 grid gap-4">
          {reportsQuery.isLoading ? <Card className="p-5 text-brand-muted">Loading reports...</Card> : null}
          {reportsQuery.data?.results.map((report) => (
            <div className="space-y-3" key={report.id}>
              <InspectionReportCard report={report} />
              {["submitted", "under_review"].includes(report.status) ? (
                <Card className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto]">
                  <Button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate(report.id)}>
                    Approve
                  </Button>
                  <input
                    className="h-11 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text"
                    onChange={(event) =>
                      setReasonById((current) => ({ ...current, [report.id]: event.target.value }))
                    }
                    placeholder="Revision reason"
                    value={reasonById[report.id] ?? ""}
                  />
                  <Button
                    disabled={revisionMutation.isPending || !reasonById[report.id]?.trim()}
                    onClick={() => revisionMutation.mutate({ id: report.id, reason: reasonById[report.id] })}
                    variant="secondary"
                  >
                    Request revision
                  </Button>
                </Card>
              ) : null}
            </div>
          ))}
          {reportsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No reports match this queue.</Card>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
