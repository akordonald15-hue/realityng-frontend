"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getLead,
  assignLead,
  transitionLeadStage,
  listLeadActivities,
  logLeadActivity,
  formatLeadPipelineStage,
  formatLeadPriority,
  leadPipelineStageOptions,
  type LeadActivityType,
} from "@/lib/api/leads";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const STAGE_STYLES: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-indigo-100 text-indigo-700",
  viewing_scheduled: "bg-purple-100 text-purple-700",
  application_started: "bg-amber-100 text-amber-700",
  application_submitted: "bg-amber-100 text-amber-700",
  negotiating: "bg-orange-100 text-orange-700",
  converted: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

const ACTIVITY_TYPE_OPTIONS: { value: LeadActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "follow_up_scheduled", label: "Follow-up scheduled" },
  { value: "follow_up_completed", label: "Follow-up completed" },
];

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;
  const queryClient = useQueryClient();

  const [assigneeInput, setAssigneeInput] = useState("");
  const [activityType, setActivityType] = useState<LeadActivityType>("note");
  const [activityNote, setActivityNote] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const {
    data: lead,
    isLoading: leadLoading,
    isError: leadError,
  } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId),
    enabled: !!leadId,
  });

  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => listLeadActivities(leadId),
    enabled: !!leadId,
  });

  const assignMutation = useMutation({
    mutationFn: (assignedToId: string | null) =>
      assignLead({ leadId, assignedToId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setAssigneeInput("");
    },
  });

  const transitionMutation = useMutation({
    mutationFn: (pipelineStage: string) =>
      transitionLeadStage({
        leadId,
        pipelineStage: pipelineStage as Parameters<
          typeof transitionLeadStage
        >[0]["pipelineStage"],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: () =>
      logLeadActivity({
        leadId,
        activityType,
        note: activityNote || undefined,
        scheduledFor: scheduledFor || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setActivityNote("");
      setScheduledFor("");
    },
  });

  if (leadLoading) {
    return (
      <ProtectedRoute>
        <main className="p-4">
          <p className="text-sm text-brand-muted">Loading lead...</p>
        </main>
      </ProtectedRoute>
    );
  }

  if (leadError || !lead) {
    return (
      <ProtectedRoute>
        <main className="p-4">
          <p className="text-sm text-red-600">
            Could not load this lead. It may not exist or you may not have
            access.
          </p>
          <Link href="/dashboard/leads" className="text-sm underline">
            Back to leads
          </Link>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="p-4 space-y-6">
        <SectionHeader
          title={lead.property?.title ?? "Lead"}
          description={`Lead from ${lead.interested_user?.full_name ?? "unknown"}`}
        />

        <Link
          href="/dashboard/leads"
          className="text-sm text-brand-muted underline"
        >
          &larr; Back to leads
        </Link>

        {/* Summary */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_STYLES[lead.priority] ?? "bg-gray-100 text-gray-700"}`}
            >
              {formatLeadPriority(lead.priority)}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${STAGE_STYLES[lead.pipeline_stage] ?? "bg-gray-100 text-gray-700"}`}
            >
              {formatLeadPipelineStage(lead.pipeline_stage)}
            </span>
          </div>

          <div className="text-sm space-y-1">
            <p>
              <span className="text-brand-muted">Property: </span>
              {lead.property?.title ?? "-"}
            </p>
            <p>
              <span className="text-brand-muted">Interested user: </span>
              {lead.interested_user?.full_name ?? "-"}
            </p>
            <p>
              <span className="text-brand-muted">Source: </span>
              {lead.source || "-"}
            </p>
            <p>
              <span className="text-brand-muted">Assigned to: </span>
              {lead.assigned_to?.full_name ?? "Unassigned"}
            </p>
            <p>
              <span className="text-brand-muted">Last contacted: </span>
              {lead.last_contacted_at
                ? new Date(lead.last_contacted_at).toLocaleString()
                : "Never"}
            </p>
            <p>
              <span className="text-brand-muted">Next follow-up: </span>
              {lead.next_follow_up_at
                ? new Date(lead.next_follow_up_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </Card>

        {/* Assign */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Assign lead</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="User ID to assign"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={!assigneeInput || assignMutation.isPending}
              onClick={() => assignMutation.mutate(assigneeInput)}
              className="rounded bg-brand-primary px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Assign
            </button>
            {lead.assigned_to && (
              <button
                type="button"
                disabled={assignMutation.isPending}
                onClick={() => assignMutation.mutate(null)}
                className="rounded border px-3 py-2 text-sm disabled:opacity-50"
              >
                Unassign
              </button>
            )}
          </div>
          {assignMutation.isError && (
            <p className="text-xs text-red-600">
              Could not update assignment.
            </p>
          )}
        </Card>

        {/* Pipeline transition */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Move pipeline stage</h2>
          <div className="flex flex-wrap gap-2">
            {leadPipelineStageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={
                  option.value === lead.pipeline_stage ||
                  transitionMutation.isPending
                }
                onClick={() => transitionMutation.mutate(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium border disabled:opacity-40 ${
                  option.value === lead.pipeline_stage
                    ? STAGE_STYLES[option.value]
                    : "bg-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {transitionMutation.isError && (
            <p className="text-xs text-red-600">
              That stage change is not allowed from the current stage.
            </p>
          )}
        </Card>

        {/* Activity log form */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Log activity</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={activityType}
              onChange={(e) =>
                setActivityType(e.target.value as LeadActivityType)
              }
              className="rounded border px-3 py-2 text-sm"
            >
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
              placeholder="Scheduled for (optional)"
            />
          </div>
          <textarea
            value={activityNote}
            onChange={(e) => setActivityNote(e.target.value)}
            placeholder="Note (optional)"
            rows={3}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={logActivityMutation.isPending}
            onClick={() => logActivityMutation.mutate()}
            className="rounded bg-brand-primary px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Log activity
          </button>
          {logActivityMutation.isError && (
            <p className="text-xs text-red-600">Could not log activity.</p>
          )}
        </Card>

        {/* Activity timeline */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Activity timeline</h2>
          {activitiesLoading && (
            <p className="text-sm text-brand-muted">Loading activity...</p>
          )}
          {activitiesError && (
            <p className="text-sm text-red-600">
              Could not load activity timeline.
            </p>
          )}
          {activities && activities.length === 0 && (
            <p className="text-sm text-brand-muted">No activity logged yet.</p>
          )}
          {activities && activities.length > 0 && (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="border-b pb-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {activity.activity_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-brand-muted">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                  {activity.note && (
                    <p className="text-brand-muted mt-1">{activity.note}</p>
                  )}
                  {activity.actor && (
                    <p className="text-xs text-brand-muted mt-1">
                      by {activity.actor.full_name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </ProtectedRoute>
  );
}
