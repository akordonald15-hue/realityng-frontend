"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { FormMessage } from "@/components/forms/form-message";
import {
  EvidenceList,
  InspectionReportCard,
  InspectionTimeline,
} from "@/components/inspections/inspection-widgets";
import { InspectionStatusBadge } from "@/components/inspections/inspection-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createInspectionReport,
  getInspectionReportForRequest,
  getInspectionRequest,
  listInspectionTimeline,
  submitInspectionReport,
  uploadInspectionEvidence,
} from "@/lib/api/inspections";

export default function InspectorAssignmentDetailPage() {
  const params = useParams<{ id: string }>()!;
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const requestQuery = useQuery({
    queryKey: ["inspection-request", params.id],
    queryFn: () => getInspectionRequest(params.id),
  });
  const reportQuery = useQuery({
    queryKey: ["inspection-report", params.id],
    queryFn: () => getInspectionReportForRequest(params.id),
    enabled: requestQuery.isSuccess,
    retry: false,
  });
  const timelineQuery = useQuery({
    queryKey: ["inspection-timeline", params.id],
    queryFn: () => listInspectionTimeline(params.id),
    enabled: requestQuery.isSuccess,
  });
  const createReportMutation = useMutation({
    mutationFn: () => {
      const data = new FormData();
      data.append("summary", summary);
      data.append("overall_condition", "good");
      data.append("risk_level", "moderate");
      data.append("recommendation", recommendation);
      return createInspectionReport(params.id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspection-report", params.id] }),
  });
  const submitMutation = useMutation({
    mutationFn: submitInspectionReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspection-report", params.id] }),
  });
  const evidenceMutation = useMutation({
    mutationFn: (reportId: string) => {
      const data = new FormData();
      if (evidenceFile) data.append("file", evidenceFile);
      data.append("evidence_type", "photo");
      data.append("category", "interior");
      data.append("visibility", "requester_visible");
      data.append("caption", "Inspection evidence");
      return uploadInspectionEvidence(reportId, data);
    },
    onSuccess: () => {
      setEvidenceFile(null);
      queryClient.invalidateQueries({ queryKey: ["inspection-report", params.id] });
    },
  });
  const request = requestQuery.data;
  const report = reportQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Inspection assignment"
        title={request?.property.title ?? "Inspection work"}
        description="Create reports, attach private evidence, and submit the result to RealityNG operations for moderation."
      />
      {requestQuery.isLoading ? (
        <Card className="mt-8 p-5 text-reality-text-secondary">Loading inspection assignment...</Card>
      ) : null}
      {requestQuery.isError ? (
        <Card className="mt-8 border-reality-border-secondary bg-reality-surfaceMuted p-6" role="status">
          <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
            This assignment is no longer available
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-reality-text-secondary">
            It may have been declined, cancelled, or reassigned. Return to your assignment list for
            the work currently available to you.
          </p>
        </Card>
      ) : null}
      {requestQuery.isSuccess ? (
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {request ? (
            <Card className="p-5">
              <InspectionStatusBadge status={request.status} />
              <p className="mt-4 text-sm leading-6 text-reality-text-secondary">{request.description}</p>
            </Card>
          ) : null}
          {report ? (
            <>
              <InspectionReportCard report={report} />
              <Card className="p-5">
                <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                  Private evidence
                </h2>
                <div className="mt-5">
                  <EvidenceList evidence={report.evidence} />
                </div>
                <form
                  className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    evidenceMutation.mutate(report.id);
                  }}
                >
                  <label className="grid gap-2 text-sm font-semibold text-reality-text-primary">
                    Evidence file
                    <Input
                      accept="image/jpeg,image/png,application/pdf"
                      aria-describedby="inspection-evidence-help"
                      onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
                      required
                      type="file"
                    />
                    <span className="text-xs font-normal text-reality-text-secondary" id="inspection-evidence-help">
                      JPEG, PNG, or PDF only. Evidence remains private and access controlled.
                    </span>
                  </label>
                  <Button disabled={evidenceMutation.isPending || !evidenceFile} type="submit">
                    {evidenceMutation.isPending ? "Uploading..." : "Upload evidence"}
                  </Button>
                </form>
                {evidenceMutation.isError ? (
                  <div className="mt-4">
                    <FormMessage tone="error">{getApiErrorMessage(evidenceMutation.error)}</FormMessage>
                  </div>
                ) : null}
              </Card>
            </>
          ) : (
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Draft report
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  createReportMutation.mutate();
                }}
              >
                <label className="block text-sm font-semibold text-reality-text-primary">
                  Summary
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-reality-text-primary"
                    onChange={(event) => setSummary(event.target.value)}
                    required
                    value={summary}
                  />
                </label>
                <label className="block text-sm font-semibold text-reality-text-primary">
                  Recommendation
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-reality-text-primary"
                    onChange={(event) => setRecommendation(event.target.value)}
                    required
                    value={recommendation}
                  />
                </label>
                <Select aria-label="Overall condition" disabled value="good">
                  <option value="good">Good condition</option>
                </Select>
                {createReportMutation.isError ? (
                  <FormMessage tone="error">
                    {getApiErrorMessage(createReportMutation.error)}
                  </FormMessage>
                ) : null}
                <Button disabled={createReportMutation.isPending} type="submit">
                  {createReportMutation.isPending ? "Creating..." : "Create draft report"}
                </Button>
              </form>
            </Card>
          )}

          {report && report.status === "draft" ? (
            <div>
              <Button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate(report.id)}>
                {submitMutation.isPending ? "Submitting..." : "Submit report for review"}
              </Button>
              {submitMutation.isError ? (
                <div className="mt-3">
                  <FormMessage tone="error">{getApiErrorMessage(submitMutation.error)}</FormMessage>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-display text-2xl font-semibold text-reality-text-primary">Timeline</h2>
          <div className="mt-5">
            <InspectionTimeline events={timelineQuery.data ?? []} />
          </div>
        </Card>
      </div>
      ) : null}
    </main>
  );
}
