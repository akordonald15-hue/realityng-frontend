"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import {
  assignLead,
  formatLeadPipelineStage,
  formatLeadPriority,
  getLead,
  leadPipelineStageOptions,
  listLeadActivities,
  logLeadActivity,
  transitionLeadStage,
  type LeadActivity,
  type LeadActivityType,
  type LeadPipelineStage,
  type LeadPriority,
} from "@/lib/api/leads";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isAdmin, isApprovedSupplyUser } from "@/lib/auth/permissions";
import { useAuth } from "@/providers/auth-provider";

const stageTone: Record<LeadPipelineStage, "approved" | "pending" | "rejected" | "info" | "neutral"> = {
  new: "neutral",
  contacted: "info",
  qualified: "info",
  viewing_scheduled: "pending",
  application_started: "pending",
  application_submitted: "pending",
  negotiating: "pending",
  converted: "approved",
  closed_lost: "rejected",
};

const priorityTone: Record<LeadPriority, "approved" | "pending" | "rejected" | "info" | "neutral"> = {
  low: "neutral",
  medium: "info",
  high: "pending",
  urgent: "rejected",
};

const activityTypeOptions: { value: LeadActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "follow_up_scheduled", label: "Follow-up scheduled" },
  { value: "follow_up_completed", label: "Follow-up completed" },
];

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-reality-border-secondary py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-reality-text-primary">{value || "-"}</dd>
    </div>
  );
}

function ActivityTimeline({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm leading-6 text-reality-text-secondary">No activity logged yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {activities.map((activity) => (
        <li className="relative border-l border-reality-border-secondary pl-5" key={activity.id}>
          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-reality-brand-500" />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm font-semibold capitalize text-reality-text-primary">
              {activity.activity_type.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-reality-text-quaternary">
              {formatDateTime(activity.created_at)}
            </p>
          </div>
          {activity.note ? (
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">{activity.note}</p>
          ) : null}
          {activity.actor ? (
            <p className="mt-1 text-xs text-reality-text-quaternary">
              Logged by {activity.actor.full_name}
            </p>
          ) : null}
          {activity.scheduled_for ? (
            <p className="mt-1 text-xs text-reality-text-quaternary">
              Scheduled for {formatDateTime(activity.scheduled_for)}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [assigneeInput, setAssigneeInput] = useState("");
  const [activityType, setActivityType] = useState<LeadActivityType>("note");
  const [activityNote, setActivityNote] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [formError, setFormError] = useState("");

  const canViewSupplyCrm = authLoading || isAdmin(user) || isApprovedSupplyUser(user);

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId),
    enabled: Boolean(leadId) && canViewSupplyCrm,
  });

  const activitiesQuery = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => listLeadActivities(leadId),
    enabled: Boolean(leadId) && canViewSupplyCrm,
  });

  const assignMutation = useMutation({
    mutationFn: (assignedToId: string | null) => assignLead({ leadId, assignedToId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setAssigneeInput("");
      setFormError("");
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const transitionMutation = useMutation({
    mutationFn: (pipelineStage: LeadPipelineStage) =>
      transitionLeadStage({ leadId, pipelineStage }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setFormError("");
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const logActivityMutation = useMutation({
    mutationFn: () =>
      logLeadActivity({
        leadId,
        activityType,
        note: activityNote || undefined,
        scheduledFor: scheduledFor || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] });
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setActivityNote("");
      setScheduledFor("");
      setFormError("");
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const lead = leadQuery.data;

  return (
    <ProtectedRoute>
      <PageContainer className="py-10">
        {!canViewSupplyCrm ? (
          <Card className="p-8" variant="reality">
            <p className="font-semibold text-reality-text-primary">Lead access unavailable.</p>
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
              Lead management is available to approved supply-side users with backend access to the related property.
            </p>
            <Link className="mt-4 inline-flex text-sm font-semibold text-reality-brand-600" href="/dashboard">
              Back to dashboard
            </Link>
          </Card>
        ) : leadQuery.isLoading ? (
          <Card className="animate-pulse p-8" variant="reality">
            <div className="h-7 w-2/5 rounded-full bg-reality-bg-muted" />
            <div className="mt-4 h-4 w-3/5 rounded-full bg-reality-bg-muted" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-48 rounded-[24px] bg-reality-bg-muted" />
              <div className="h-48 rounded-[24px] bg-reality-bg-muted" />
            </div>
          </Card>
        ) : leadQuery.isError || !lead ? (
          <Card className="p-8" variant="reality">
            <p className="font-semibold text-reality-text-primary">
              Could not load this lead.
            </p>
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
              It may not exist, or the backend may have denied access for this account.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => void leadQuery.refetch()} variant="realitySecondary">
                Retry
              </Button>
              <Link className="inline-flex h-11 items-center text-sm font-semibold text-reality-brand-600" href="/dashboard/leads">
                Back to leads
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Link className="text-sm font-medium text-reality-brand-600" href="/dashboard/leads">
                  Dashboard &gt; Leads
                </Link>
                <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-reality-text-primary">
                  {lead.property.title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                  Lead from {lead.interested_user.full_name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusChip tone={stageTone[lead.pipeline_stage]}>
                  {formatLeadPipelineStage(lead.pipeline_stage)}
                </StatusChip>
                <StatusChip tone={priorityTone[lead.priority]}>
                  {formatLeadPriority(lead.priority)} priority
                </StatusChip>
              </div>
            </div>

            {formError ? (
              <Card className="mt-6 border-red-200 bg-red-50 p-4 text-sm text-red-700" variant="reality">
                {formError}
              </Card>
            ) : null}

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <Card className="p-6" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">Lead details</h2>
                  <dl className="mt-4">
                    <DetailRow label="Customer" value={lead.interested_user.full_name} />
                    <DetailRow label="Email" value={lead.interested_user.email} />
                    <DetailRow label="Phone" value={lead.interested_user.phone_number ?? "Not provided"} />
                    <DetailRow label="Inquiry type" value={lead.inquiry_type.replace(/_/g, " ")} />
                    <DetailRow label="Message" value={lead.message || "No message provided"} />
                    <DetailRow label="Internal notes" value={lead.internal_notes || "No internal notes"} />
                  </dl>
                </Card>

                <Card className="p-6" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">Property context</h2>
                  <dl className="mt-4">
                    <DetailRow
                      label="Property"
                      value={
                        lead.property.slug ? (
                          <Link className="font-semibold text-reality-brand-600 hover:underline" href={`/properties/${lead.property.slug}`}>
                            {lead.property.title}
                          </Link>
                        ) : (
                          lead.property.title
                        )
                      }
                    />
                    <DetailRow label="Location" value={`${lead.property.city}, ${lead.property.state}`} />
                    <DetailRow label="Listing" value={`${lead.property.listing_type} · ${lead.property.property_type}`} />
                    <DetailRow label="Received" value={formatDateTime(lead.created_at)} />
                    <DetailRow label="Last contacted" value={formatDateTime(lead.last_contacted_at)} />
                    <DetailRow label="Next follow-up" value={formatDateTime(lead.next_follow_up_at)} />
                  </dl>
                </Card>

                <Card className="p-6" variant="reality">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-reality-text-primary">Activity timeline</h2>
                      <p className="mt-1 text-sm text-reality-text-secondary">
                        Notes and follow-up events logged against this inquiry-backed lead.
                      </p>
                    </div>
                    {activitiesQuery.isError ? (
                      <Button onClick={() => void activitiesQuery.refetch()} variant="realitySecondary">
                        Retry
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-5">
                    {activitiesQuery.isLoading ? (
                      <p className="text-sm text-reality-text-secondary">Loading activity...</p>
                    ) : activitiesQuery.isError ? (
                      <p className="text-sm text-red-700">Could not load activity timeline.</p>
                    ) : (
                      <ActivityTimeline activities={activitiesQuery.data ?? []} />
                    )}
                  </div>
                </Card>
              </div>

              <aside className="space-y-6">
                <Card className="p-6" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">Move pipeline stage</h2>
                  <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                    Stage changes are validated by the backend transition rules.
                  </p>
                  <div className="mt-4 grid gap-2">
                    {leadPipelineStageOptions.map((option) => (
                      <Button
                        className="justify-between"
                        disabled={option.value === lead.pipeline_stage || transitionMutation.isPending}
                        key={option.value}
                        onClick={() => transitionMutation.mutate(option.value)}
                        variant={option.value === lead.pipeline_stage ? "reality" : "realitySecondary"}
                      >
                        {option.label}
                        {option.value === lead.pipeline_stage ? "Current" : ""}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">Assign lead</h2>
                  <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                    Enter a user ID with valid lead-management capability for this property.
                  </p>
                  <div className="mt-4 grid gap-3">
                    <Input
                      aria-label="Assignee user ID"
                      onChange={(event) => setAssigneeInput(event.target.value)}
                      placeholder="User ID"
                      value={assigneeInput}
                      variant="reality"
                    />
                    <Button
                      disabled={!assigneeInput || assignMutation.isPending}
                      onClick={() => assignMutation.mutate(assigneeInput)}
                      variant="reality"
                    >
                      {assignMutation.isPending ? "Assigning..." : "Assign"}
                    </Button>
                    {lead.assigned_to ? (
                      <Button
                        disabled={assignMutation.isPending}
                        onClick={() => assignMutation.mutate(null)}
                        variant="realitySecondary"
                      >
                        Unassign {lead.assigned_to.full_name}
                      </Button>
                    ) : null}
                  </div>
                </Card>

                <Card className="p-6" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">Log activity</h2>
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                        Activity type
                      </span>
                      <Select
                        aria-label="Activity type"
                        onChange={(event) => setActivityType(event.target.value as LeadActivityType)}
                        value={activityType}
                        variant="reality"
                      >
                        {activityTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                        Scheduled for
                      </span>
                      <Input
                        aria-label="Scheduled for"
                        onChange={(event) => setScheduledFor(event.target.value)}
                        type="datetime-local"
                        value={scheduledFor}
                        variant="reality"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                        Note
                      </span>
                      <textarea
                        aria-label="Activity note"
                        className="min-h-28 w-full rounded-[12px] border border-reality-border-secondary bg-white px-3 py-3 text-sm text-reality-text-primary shadow-reality-sm outline-none transition placeholder:text-reality-text-quaternary focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                        onChange={(event) => setActivityNote(event.target.value)}
                        placeholder="Add a short note"
                        value={activityNote}
                      />
                    </label>
                    <Button
                      disabled={logActivityMutation.isPending}
                      onClick={() => logActivityMutation.mutate()}
                      variant="reality"
                    >
                      {logActivityMutation.isPending ? "Logging..." : "Log activity"}
                    </Button>
                  </div>
                </Card>
              </aside>
            </div>
          </>
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}
