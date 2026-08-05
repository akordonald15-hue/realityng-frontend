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
  const params = useParams<{ id: string }>();
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
    retry: false,
  });
  const timelineQuery = useQuery({
    queryKey: ["inspection-timeline", params.id],
    queryFn: () => listInspectionTimeline(params.id),
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
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {request ? (
            <Card className="p-5">
              <InspectionStatusBadge status={request.status} />
              <p className="mt-4 text-sm leading-6 text-brand-muted">{request.description}</p>
            </Card>
          ) : null}
          {report ? (
            <>
              <InspectionReportCard report={report} />
              <Card className="p-5">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
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
                  <Input
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
                    required
                    type="file"
                  />
                  <Button disabled={evidenceMutation.isPending || !evidenceFile} type="submit">
                    Upload evidence
                  </Button>
                </form>
              </Card>
            </>
          ) : (
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Draft report
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  createReportMutation.mutate();
                }}
              >
                <label className="block text-sm font-semibold text-brand-text">
                  Summary
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-brand-text"
                    onChange={(event) => setSummary(event.target.value)}
                    required
                    value={summary}
                  />
                </label>
                <label className="block text-sm font-semibold text-brand-text">
                  Recommendation
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-brand-text"
                    onChange={(event) => setRecommendation(event.target.value)}
                    required
                    value={recommendation}
                  />
                </label>
                <Select disabled value="good">
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
            <Button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate(report.id)}>
              {submitMutation.isPending ? "Submitting..." : "Submit report for review"}
            </Button>
          ) : null}
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-heading text-2xl font-semibold text-brand-text">Timeline</h2>
          <div className="mt-5">
            <InspectionTimeline events={timelineQuery.data ?? []} />
          </div>
        </Card>
      </div>
    </main>
  );
}
