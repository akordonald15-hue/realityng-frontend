"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ApplicationRequestCard } from "@/components/dashboard/application-request-card";
import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { ManagedPropertyCard } from "@/components/properties/managed-property-card";
import { PropertyCard } from "@/components/properties/property-card";
import { ViewingRequestButton } from "@/components/properties/viewing-request-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import { WorkflowStatusBadge } from "@/components/workflow/status-badge";
import {
  approveApplication,
  formatApplicationStatus,
  markApplicationUnderReview,
  rejectApplication,
  updateApplicationNotes,
  withdrawApplication,
  type RentalApplication,
} from "@/lib/api/applications";
import { getDashboardOverview, type DashboardOverview } from "@/lib/api/dashboard";
import {
  formatInquiryStatus,
  inquiryStatusOptions,
  updateInquiryNotes,
  updateInquiryStatus,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/api/inquiries";
import { listThreads, type ConversationThread } from "@/lib/api/messages";
import { listManagedProperties, type PaginatedProperties } from "@/lib/api/properties";
import {
  cancelViewing,
  completeViewing,
  confirmViewing,
  formatViewingStatus,
  formatViewingType,
  rescheduleViewing,
  updateViewingNotes,
  type Viewing,
  type ViewingDecisionPayload,
} from "@/lib/api/viewings";
import type { ActivityItem, TransactionItem } from "@/lib/api/workflow";
import { isAdmin, isApprovedSupplyUser } from "@/lib/auth/permissions";
import { formatPrice } from "@/lib/properties/format";
import { useAuth } from "@/providers/auth-provider";

const dashboardLinks = [
  {
    href: "/properties/new",
    title: "Create property",
    description: "Start a draft listing and add media before submitting for review.",
  },
  {
    href: "/saved-properties",
    title: "View saved properties",
    description: "Return to homes, land, and commercial listings you saved while browsing.",
  },
  {
    href: "/properties",
    title: "Browse properties",
    description: "Review the public approved listing experience.",
  },
  {
    href: "/settings/profile",
    title: "Edit profile",
    description: "Keep contact and identity details current for property workflows.",
  },
  {
    href: "/dashboard/construction",
    title: "Construction tracking",
    description: "Monitor managed projects, milestone progress, evidence, and inspections.",
  },
];

const buyerActionLinks = [
  {
    href: "/properties",
    title: "Search properties",
    description: "Browse approved homes, land, shortlets, and commercial listings.",
  },
  {
    href: "/saved-properties",
    title: "Saved properties",
    description: "Continue reviewing properties you shortlisted while browsing.",
  },
  {
    href: "/verification",
    title: "Verification centre",
    description: "Start or review identity and trust verification where required.",
  },
  {
    href: "/settings/profile",
    title: "Profile and contact",
    description: "Keep your details current for inquiries, viewings, and applications.",
  },
  {
    href: "/dashboard/construction",
    title: "Construction updates",
    description: "Follow project timelines and evidence where you are an approved stakeholder.",
  },
];

const supplyActionLinks = [
  ...dashboardLinks,
  {
    href: "/dashboard/artisan",
    title: "Provider profile",
    description: "Manage trades, service areas, portfolio samples, and moderation status.",
  },
  {
    href: "/dashboard/construction/operations",
    title: "Construction operations",
    description: "Submit project updates and monitor milestone inspection gates.",
  },
  {
    href: "/verification",
    title: "Verification centre",
    description: "Manage professional, ownership, or listing verification requests.",
  },
];

const adminActionLinks = [
  {
    href: "/admin",
    title: "Admin workspace",
    description: "Review platform operations, queues, and moderation tasks.",
  },
  {
    href: "/admin/verifications",
    title: "Verification queue",
    description: "Inspect private documents and approve or reject verification requests.",
  },
  {
    href: "/admin/services/providers",
    title: "Service provider queue",
    description: "Moderate artisan profiles, service areas, and portfolio readiness.",
  },
  {
    href: "/admin/construction",
    title: "Construction oversight",
    description:
      "Monitor projects, stakeholders, progress updates, and inspection-linked milestones.",
  },
  {
    href: "/properties",
    title: "Public marketplace",
    description: "Check the live browsing experience for approved properties.",
  },
  {
    href: "/dashboard",
    title: "Transaction centre",
    description: "Monitor workflow activity across inquiries, viewings, and applications.",
  },
];

function InquiryDate({ value }: { value: string }) {
  return (
    <span>
      {new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))}
    </span>
  );
}

function ViewingDate({ viewing }: { viewing: Viewing }) {
  const date = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(viewing.preferred_date));
  const time = viewing.preferred_time.slice(0, 5);

  return (
    <span>
      {date} at {time}
    </span>
  );
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function defaultDecisionDateTime(viewing: Viewing) {
  if (viewing.confirmed_datetime) {
    return toDateTimeLocalValue(viewing.confirmed_datetime);
  }
  return `${viewing.preferred_date}T${viewing.preferred_time.slice(0, 5) || "10:00"}`;
}

function buildViewingDecision(form: HTMLFormElement, viewingId: string): ViewingDecisionPayload {
  const formData = new FormData(form);
  return {
    viewingId,
    confirmed_datetime: String(formData.get("confirmed_datetime") ?? ""),
    meeting_location: String(formData.get("meeting_location") ?? ""),
    meeting_link: String(formData.get("meeting_link") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

function MyInterestsList({ inquiries }: { inquiries: Inquiry[] }) {
  if (inquiries.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Your shown interests will appear here after you submit an inquiry from a property page.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.slice(0, 5).map((inquiry) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={inquiry.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{inquiry.property.title}</p>
              <p className="mt-1 text-xs text-reality-text-secondary">
                <InquiryDate value={inquiry.created_at} /> · {inquiry.property.city},{" "}
                {inquiry.property.state}
              </p>
            </div>
            <WorkflowStatusBadge status={inquiry.status}>
              {formatInquiryStatus(inquiry.status)}
            </WorkflowStatusBadge>
          </div>
          {inquiry.message ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{inquiry.message}</p>
          ) : null}
          <ViewingRequestButton
            disabled={inquiry.status === "closed" || inquiry.status === "converted"}
            inquiryId={inquiry.id}
          />
        </div>
      ))}
    </div>
  );
}

function MyViewingsList({ viewings }: { viewings: Viewing[] }) {
  const queryClient = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: cancelViewing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });

  if (viewings.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Requested and confirmed property viewings will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewings.slice(0, 5).map((viewing) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={viewing.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{viewing.property.title}</p>
              <p className="mt-1 text-sm text-reality-text-secondary">
                <ViewingDate viewing={viewing} /> - {formatViewingType(viewing.viewing_type)}
              </p>
              {viewing.confirmed_datetime ? (
                <p className="mt-1 text-xs text-reality-text-secondary">
                  Confirmed:{" "}
                  {new Intl.DateTimeFormat("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(viewing.confirmed_datetime))}
                </p>
              ) : null}
            </div>
            <WorkflowStatusBadge status={viewing.status}>
              {formatViewingStatus(viewing.status)}
            </WorkflowStatusBadge>
          </div>
          {viewing.notes ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{viewing.notes}</p>
          ) : null}
          {viewing.status !== "completed" && viewing.status !== "cancelled" ? (
            <Button
              className="mt-3 h-9"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate({ viewingId: viewing.id })}
              type="button"
              variant="secondary"
            >
              Cancel request
            </Button>
          ) : null}
          {viewing.status === "completed" ? (
            <Link
              className={buttonClasses("reality", "mt-3 h-9")}
              href={`/apply/${viewing.property.id}?viewing=${viewing.id}&slug=${viewing.property.slug}`}
            >
              Apply now
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ApplicationDate({ value }: { value: string }) {
  return (
    <span>
      {new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))}
    </span>
  );
}

function TimelineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={
          active
            ? "h-2.5 w-2.5 shrink-0 rounded-full bg-brand-secondary"
            : "h-2.5 w-2.5 shrink-0 rounded-full bg-white/20"
        }
      />
      <span className={active ? "text-xs text-reality-text-primary" : "text-xs text-reality-text-secondary"}>
        {label}
      </span>
    </div>
  );
}

function WorkflowTimeline({ stage }: { stage: string }) {
  const activeStages = new Set<string>();
  if (["new", "contacted", "viewing_scheduled"].includes(stage)) {
    activeStages.add("Inquiry");
  }
  if (["requested", "rescheduled", "confirmed", "completed"].includes(stage)) {
    activeStages.add("Inquiry").add("Viewing");
  }
  if (["submitted", "under_review", "approved", "rejected", "withdrawn"].includes(stage)) {
    activeStages.add("Inquiry").add("Viewing").add("Application");
  }
  if (["approved", "rejected"].includes(stage)) {
    activeStages.add("Decision");
  }
  const steps = ["Inquiry", "Viewing", "Application", "Decision"];

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-4">
      {steps.map((step) => (
        <TimelineStep active={activeStages.has(step)} key={step} label={step} />
      ))}
    </div>
  );
}

function TransactionCenter({ transactions }: { transactions: TransactionItem[] }) {
  if (transactions.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Active property transactions will appear here as users move from interest to viewing and
        application.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {transactions.slice(0, 6).map((transaction) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={transaction.inquiry_id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{transaction.property.title}</p>
              <p className="mt-1 text-sm text-reality-text-secondary">
                {transaction.property.city}, {transaction.property.state}
              </p>
            </div>
            <WorkflowStatusBadge status={transaction.stage}>
              {transaction.stage_label}
            </WorkflowStatusBadge>
          </div>
          <WorkflowTimeline stage={transaction.stage} />
          <div className="mt-4 rounded-md bg-reality-bg-subtle p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-reality-text-secondary">
              Next action
            </p>
            <p className="mt-1 text-sm text-reality-text-primary">{transaction.next_action}</p>
          </div>
          {transaction.stage === "completed" ? (
            <Link
              className={buttonClasses("reality", "mt-3 h-9")}
              href={`/apply/${transaction.property.id}?inquiry=${transaction.inquiry_id ?? ""}&viewing=${transaction.viewing_id ?? ""}&slug=${transaction.property.slug}`}
            >
              Apply for property
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Activity will appear here as saves, inquiries, viewings, and applications happen.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activity.slice(0, 8).map((item) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={item.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-reality-text-primary">{item.label}</p>
            <span className="text-xs text-reality-text-secondary">
              <ApplicationDate value={item.occurred_at} />
            </span>
          </div>
          <p className="mt-1 text-sm text-reality-text-secondary">{item.entity_type}</p>
        </div>
      ))}
    </div>
  );
}

function NotificationCenterPlaceholder() {
  const events = [
    "Inquiry Created",
    "Viewing Requested",
    "Viewing Confirmed",
    "Application Submitted",
    "Application Approved",
    "Application Rejected",
  ];

  return (
    <Card className="p-5">
      <h2 className="font-display text-2xl font-semibold text-reality-text-primary">Notification center</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {events.map((event) => (
          <Badge key={event} variant="muted">
            {event}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function MyApplicationsList({ applications }: { applications: RentalApplication[] }) {
  const queryClient = useQueryClient();
  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });

  if (applications.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Rental applications you submit will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.slice(0, 5).map((application) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={application.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{application.property.title}</p>
              <p className="mt-1 text-sm text-reality-text-secondary">
                Submitted <ApplicationDate value={application.created_at} /> - Move-in{" "}
                <ApplicationDate value={application.move_in_date} />
              </p>
            </div>
            <WorkflowStatusBadge status={application.status}>
              {formatApplicationStatus(application.status)}
            </WorkflowStatusBadge>
          </div>
          {application.message ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{application.message}</p>
          ) : null}
          {application.status === "submitted" || application.status === "under_review" ? (
            <Button
              className="mt-3 h-9"
              disabled={withdrawMutation.isPending}
              onClick={() => withdrawMutation.mutate(application.id)}
              type="button"
              variant="secondary"
            >
              Withdraw
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PropertyInquiryManager({ inquiries }: { inquiries: Inquiry[] }) {
  const queryClient = useQueryClient();
  const statusMutation = useMutation({
    mutationFn: updateInquiryStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });
  const notesMutation = useMutation({
    mutationFn: updateInquiryNotes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });

  if (inquiries.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Buyer and tenant inquiries for your properties will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.slice(0, 5).map((inquiry) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={inquiry.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{inquiry.interested_user.full_name}</p>
              <p className="mt-1 text-sm text-reality-text-secondary">{inquiry.interested_user.email}</p>
              <p className="mt-2 text-sm text-reality-text-secondary">{inquiry.property.title}</p>
            </div>
            <WorkflowStatusBadge status={inquiry.status}>
              {formatInquiryStatus(inquiry.status)}
            </WorkflowStatusBadge>
          </div>
          {inquiry.message ? (
            <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{inquiry.message}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-secondary">
                Status
              </span>
              <Select
                aria-label={`Status for ${inquiry.interested_user.full_name}`}
                className="mt-2"
                disabled={statusMutation.isPending}
                onChange={(event) =>
                  statusMutation.mutate({
                    inquiryId: inquiry.id,
                    status: event.target.value as InquiryStatus,
                  })
                }
                value={inquiry.status}
              >
                {inquiryStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                notesMutation.mutate({
                  inquiryId: inquiry.id,
                  internalNotes: String(formData.get("internal_notes") ?? ""),
                });
              }}
            >
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-secondary">
                  Internal notes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-secondary/60 focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                  defaultValue={inquiry.internal_notes}
                  name="internal_notes"
                  placeholder="Add private owner notes"
                />
              </label>
              <Button className="mt-2 h-9" disabled={notesMutation.isPending} type="submit">
                Save notes
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

function ViewingRequestsManager({ viewings }: { viewings: Viewing[] }) {
  const queryClient = useQueryClient();
  const decisionMutation = useMutation({
    mutationFn: ({
      action,
      payload,
    }: {
      action: "confirm" | "reschedule";
      payload: ViewingDecisionPayload;
    }) => (action === "confirm" ? confirmViewing(payload) : rescheduleViewing(payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });
  const cancelMutation = useMutation({
    mutationFn: cancelViewing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });
  const completeMutation = useMutation({
    mutationFn: completeViewing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });
  const notesMutation = useMutation({
    mutationFn: updateViewingNotes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });

  if (viewings.length === 0) {
    return (
      <Card className="border border-reality-border bg-white p-5 text-sm text-reality-text-muted shadow-sm">
        <p className="font-medium text-reality-text-primary">No viewing requests yet.</p>
        <p className="mt-1">
          Viewing requests for properties you own or manage will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewings.slice(0, 5).map((viewing) => {
        const canManage = viewing.can_manage_viewing;
        const isTerminal = viewing.status === "completed" || viewing.status === "cancelled";
        const canSchedule = canManage && ["requested", "rescheduled"].includes(viewing.status);
        const canComplete = canManage && viewing.status === "confirmed";
        const canCancel = canManage && !isTerminal;

        return (
          <Card
            className="border border-reality-border bg-white p-4 shadow-sm transition hover:border-reality-primary/30 hover:shadow-md"
            key={viewing.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-reality-text-primary">
                  {viewing.requester.full_name}
                </p>
                <p className="mt-1 text-sm text-reality-text-secondary">
                  {viewing.property.title}
                </p>
                <p className="mt-1 text-xs text-reality-text-muted">
                  Requested <ViewingDate viewing={viewing} /> -{" "}
                  {formatViewingType(viewing.viewing_type)}
                </p>
              </div>
              <WorkflowStatusBadge status={viewing.status}>
                {formatViewingStatus(viewing.status)}
              </WorkflowStatusBadge>
            </div>

            <form className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-muted">
                    Confirmed date and time
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-reality-border bg-white px-3 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-muted/70 focus:border-reality-primary focus:ring-2 focus:ring-reality-primary/20 disabled:bg-reality-surface-subtle disabled:text-reality-text-muted"
                    defaultValue={defaultDecisionDateTime(viewing)}
                    disabled={!canSchedule}
                    name="confirmed_datetime"
                    type="datetime-local"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-muted">
                    Meeting location
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-reality-border bg-white px-3 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-muted/70 focus:border-reality-primary focus:ring-2 focus:ring-reality-primary/20 disabled:bg-reality-surface-subtle disabled:text-reality-text-muted"
                    defaultValue={viewing.meeting_location}
                    disabled={!canSchedule}
                    name="meeting_location"
                    placeholder="Estate gate, sales office, or reception"
                  />
                </label>
              </div>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-muted">
                  Meeting link
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-reality-border bg-white px-3 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-muted/70 focus:border-reality-primary focus:ring-2 focus:ring-reality-primary/20 disabled:bg-reality-surface-subtle disabled:text-reality-text-muted"
                  defaultValue={viewing.meeting_link}
                  disabled={!canSchedule}
                  name="meeting_link"
                  placeholder="Optional virtual viewing link"
                  type="url"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-muted">
                  Shared notes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-reality-border bg-white px-3 py-2 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-muted/70 focus:border-reality-primary focus:ring-2 focus:ring-reality-primary/20 disabled:bg-reality-surface-subtle disabled:text-reality-text-muted"
                  defaultValue={viewing.notes}
                  disabled={!canManage}
                  name="notes"
                  placeholder="Participant-visible access instructions or reschedule notes"
                />
              </label>
              {!canManage ? (
                <p className="rounded-md bg-reality-surface-subtle px-3 py-2 text-sm text-reality-text-muted">
                  You can view this request, but management actions are unavailable for your
                  current permissions.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {canSchedule ? (
                  <>
                    <Button
                      className="h-9"
                      disabled={decisionMutation.isPending}
                      onClick={(event) => {
                        const form = event.currentTarget.closest("form");
                        if (form) {
                          decisionMutation.mutate({
                            action: "confirm",
                            payload: buildViewingDecision(form, viewing.id),
                          });
                        }
                      }}
                      type="button"
                    >
                      Confirm
                    </Button>
                    <Button
                      className="h-9"
                      disabled={decisionMutation.isPending}
                      onClick={(event) => {
                        const form = event.currentTarget.closest("form");
                        if (form) {
                          decisionMutation.mutate({
                            action: "reschedule",
                            payload: buildViewingDecision(form, viewing.id),
                          });
                        }
                      }}
                      type="button"
                      variant="secondary"
                    >
                      Reschedule
                    </Button>
                  </>
                ) : null}
                {canManage ? (
                  <Button
                    className="h-9"
                    disabled={notesMutation.isPending}
                    onClick={(event) => {
                      const form = event.currentTarget.closest("form");
                      if (form) {
                        const formData = new FormData(form);
                        notesMutation.mutate({
                          viewingId: viewing.id,
                          notes: String(formData.get("notes") ?? ""),
                        });
                      }
                    }}
                    type="button"
                    variant="ghost"
                  >
                    Save notes
                  </Button>
                ) : null}
                {canComplete ? (
                  <Button
                    className="h-9"
                    disabled={completeMutation.isPending}
                    onClick={() => completeMutation.mutate(viewing.id)}
                    type="button"
                    variant="secondary"
                  >
                    Complete
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    className="h-9"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate({ viewingId: viewing.id })}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        );
      })}
    </div>
  );
}

function ReceivedApplicationsManager({ applications }: { applications: RentalApplication[] }) {
  const queryClient = useQueryClient();
  const statusMutation = useMutation({
    mutationFn: ({
      action,
      applicationId,
    }: {
      action: "under_review" | "approved" | "rejected";
      applicationId: string;
    }) => {
      if (action === "under_review") {
        return markApplicationUnderReview(applicationId);
      }
      if (action === "approved") {
        return approveApplication(applicationId);
      }
      return rejectApplication(applicationId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });
  const notesMutation = useMutation({
    mutationFn: updateApplicationNotes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
  });

  if (applications.length === 0) {
    return (
      <Card className="p-5 text-sm text-reality-text-secondary">
        Rental applications for your properties will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.slice(0, 5).map((application) => (
        <div className="rounded-md border border-reality-border-secondary p-4" key={application.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-reality-text-primary">{application.full_name}</p>
              <p className="mt-1 text-sm text-reality-text-secondary">{application.email}</p>
              <p className="mt-2 text-sm text-reality-text-secondary">{application.property.title}</p>
              <p className="mt-1 text-xs text-reality-text-secondary">
                {application.employment_status} - Move-in{" "}
                <ApplicationDate value={application.move_in_date} />
              </p>
            </div>
            <WorkflowStatusBadge status={application.status}>
              {formatApplicationStatus(application.status)}
            </WorkflowStatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                notesMutation.mutate({
                  applicationId: application.id,
                  ownerNotes: String(formData.get("owner_notes") ?? ""),
                });
              }}
            >
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-reality-text-secondary">
                  Owner notes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-secondary/60 focus:border-reality-brand-500 focus:ring-2 focus:ring-reality-brand-500/15"
                  defaultValue={application.owner_notes}
                  name="owner_notes"
                  placeholder="Add private application review notes"
                />
              </label>
              <Button className="mt-2 h-9" disabled={notesMutation.isPending} type="submit">
                Save notes
              </Button>
            </form>
            <div className="flex flex-col gap-2">
              <Link
                className={buttonClasses("realitySecondary", "h-9 w-full")}
                href={`/dashboard/applications/${application.id}`}
              >
                Open detail
              </Link>
              {application.status === "submitted" ? (
                <Button
                  className="h-9"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({
                      action: "under_review",
                      applicationId: application.id,
                    })
                  }
                  type="button"
                  variant="secondary"
                >
                  Mark review
                </Button>
              ) : null}
              {application.status === "under_review" ? (
                <>
                  <Button
                    className="h-9"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        action: "approved",
                        applicationId: application.id,
                      })
                    }
                    type="button"
                  >
                    Approve
                  </Button>
                  <Button
                    className="h-9"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        action: "rejected",
                        applicationId: application.id,
                      })
                    }
                    type="button"
                    variant="secondary"
                  >
                    Reject
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function metricValue(
  metrics: { label: string; value: string }[] | undefined,
  labels: string | string[],
) {
  const labelSet = new Set(
    (Array.isArray(labels) ? labels : [labels]).map((label) => label.toLowerCase()),
  );
  return metrics?.find((metric) => labelSet.has(metric.label.toLowerCase()))?.value ?? "0";
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-reality-brand-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-2xl font-semibold text-reality-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-reality-text-secondary">{description}</p>
    </div>
  );
}

function MetricGrid({
  isLoading,
  metrics,
}: {
  isLoading: boolean;
  metrics: { label: string; value: string; detail: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <Card className="p-5" key={item.label}>
          <p className="text-sm text-reality-text-secondary">{item.label}</p>
          <p className="mt-3 font-display text-4xl font-semibold text-reality-brand-600">
            {isLoading ? "-" : item.value}
          </p>
          <p className="mt-2 text-xs leading-5 text-reality-text-secondary">{item.detail}</p>
        </Card>
      ))}
    </div>
  );
}

function ActionGrid({
  actions,
}: {
  actions: { href: string; title: string; description: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((item) => (
        <Link className="group block focus:outline-none" href={item.href} key={item.href}>
          <Card className="h-full p-5 transition group-hover:border-brand-secondary/60 group-focus-visible:ring-2 group-focus-visible:ring-reality-brand-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white">
            <h3 className="text-base font-semibold text-reality-text-primary">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">{item.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function BuyerJourneySummary({
  metrics,
  variant = "buyer",
}: {
  metrics: { label: string; value: string; detail: string }[] | undefined;
  variant?: "buyer" | "supply";
}) {
  const stages =
    variant === "supply"
      ? [
          {
            label: "Listings",
            value: metricValue(metrics, "Active listings"),
            description: "Approved listings visible in the marketplace.",
          },
          {
            label: "Leads",
            value: metricValue(metrics, ["Property inquiries", "Leads"]),
            description: "Buyer or tenant interest requiring follow-up.",
          },
          {
            label: "Viewings",
            value: metricValue(metrics, "Viewing requests"),
            description: "Requested, confirmed, or completed property visits.",
          },
          {
            label: "Applications",
            value: metricValue(metrics, "Received applications"),
            description: "Rental applications awaiting owner review.",
          },
        ]
      : [
          {
            label: "Saved",
            value: metricValue(metrics, "Saved properties"),
            description: "Properties shortlisted for closer review.",
          },
          {
            label: "Interests",
            value: metricValue(metrics, "My interests"),
            description: "Structured inquiries sent to owners or agents.",
          },
          {
            label: "Viewings",
            value: metricValue(metrics, "My viewings"),
            description: "Requested or confirmed property visits.",
          },
          {
            label: "Applications",
            value: metricValue(metrics, "My applications"),
            description: "Rental applications under review.",
          },
        ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stages.map((stage, index) => (
        <Card className="relative p-4" key={stage.label}>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-reality-text-secondary">
            Step {index + 1}
          </span>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="font-display text-xl font-semibold text-reality-text-primary">{stage.label}</p>
            <p className="font-display text-3xl font-semibold text-reality-brand-600">
              {stage.value}
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-reality-text-secondary">{stage.description}</p>
        </Card>
      ))}
    </div>
  );
}

const buyerDashboardTabs = [
  { label: "Overview", value: "overview" },
  { label: "Requests", value: "requests" },
  { label: "Saved", value: "saved" },
  { label: "Viewed", value: "viewed" },
  { label: "Activity", value: "activity" },
];

function DashboardIcon({ type }: { type: "file" | "check" | "heart" | "headset" }) {
  const paths = {
    file: (
      <>
        <path d="M7 3.5H14L19 8.5V20.5H7V3.5Z" />
        <path d="M14 3.5V8.5H19" />
        <path d="M10 13H16" />
        <path d="M10 16H15" />
      </>
    ),
    check: (
      <>
        <path d="M7 3.5H14L19 8.5V20.5H7V3.5Z" />
        <path d="M14 3.5V8.5H19" />
        <path d="M10 15L12 17L16 12" />
      </>
    ),
    heart: (
      <path d="M12 20S4.5 15.5 4.5 9.5A4.25 4.25 0 0 1 12 6.75A4.25 4.25 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20Z" />
    ),
    headset: (
      <>
        <path d="M5 12A7 7 0 0 1 19 12" />
        <path d="M5 12V15A2 2 0 0 0 7 17H8V11H7A2 2 0 0 0 5 13" />
        <path d="M19 12V15A2 2 0 0 1 17 17H16V11H17A2 2 0 0 1 19 13" />
        <path d="M16 17.5C15.3 19 13.9 20 12 20" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[type]}
      </g>
    </svg>
  );
}

function BuyerSectionHeader({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-medium leading-8 text-reality-text-primary">{title}</h2>
        {description ? (
          <p className="mt-2 text-base leading-6 text-reality-text-secondary">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function BuyerMetricGrid({
  isLoading,
  overview,
}: {
  isLoading: boolean;
  overview?: DashboardOverview;
}) {
  const metricCards = [
    {
      icon: "file" as const,
      label: "Active listing",
      value: metricValue(overview?.metrics, "Active listings"),
      detail: "Approved listings visible to this account.",
    },
    {
      icon: "check" as const,
      label: "My application",
      value: metricValue(overview?.metrics, "My applications"),
      detail: "Applications submitted for review.",
    },
    {
      icon: "heart" as const,
      label: "Saved property",
      value: metricValue(overview?.metrics, "Saved properties"),
      detail: "Shortlisted properties.",
    },
    {
      icon: "headset" as const,
      label: "Inquiries",
      value: metricValue(overview?.metrics, ["My inquiries", "My interests"]),
      detail: "Open conversations and requests.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <MetricCard
          className="rounded-[24px] border-[#f0f0f0] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
          detail={metric.detail}
          icon={<DashboardIcon type={metric.icon} />}
          key={metric.label}
          label={metric.label}
          loading={isLoading}
          value={metric.value}
        />
      ))}
    </div>
  );
}

function EmptyDashboardState({ children }: { children: React.ReactNode }) {
  return (
    <Card
      className="flex min-h-[180px] items-center justify-center rounded-[24px] border-dashed p-6 text-center text-sm leading-6 text-reality-text-quaternary"
      variant="reality"
    >
      {children}
    </Card>
  );
}

function DashboardPropertyRail({
  cta,
  empty,
  properties,
}: {
  cta?: React.ReactNode;
  empty: string;
  properties: DashboardOverview["recommendedProperties"];
}) {
  if (properties.length === 0) {
    return <EmptyDashboardState>{empty}</EmptyDashboardState>;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-6">
        {properties.slice(0, 4).map((property) => (
          <div className="w-[314px] shrink-0" key={property.id}>
            <PropertyCard property={property} variant="reality" />
          </div>
        ))}
        {cta ? <div className="flex w-[220px] shrink-0 items-center">{cta}</div> : null}
      </div>
    </div>
  );
}

function SupplyManagedPropertyRail({
  empty,
  isError,
  isLoading,
  properties,
}: {
  empty: string;
  isError?: boolean;
  isLoading?: boolean;
  properties: PaginatedProperties["results"];
}) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-6">
          {[0, 1].map((item) => (
            <Card
              className="h-[252px] w-[420px] shrink-0 animate-pulse rounded-[28px] border-reality-border-secondary bg-reality-bg-subtle"
              key={item}
              variant="realityElevated"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || properties.length === 0) {
    return <EmptyDashboardState>{empty}</EmptyDashboardState>;
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-6">
        {properties.slice(0, 4).map((property) => (
          <div className="w-[420px] shrink-0" key={property.id}>
            <ManagedPropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BuyerActivityFeed({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return <EmptyDashboardState>No recent dashboard activity yet.</EmptyDashboardState>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {activity.slice(0, 6).map((item) => (
        <Card className="rounded-[20px] p-4" key={item.id} variant="realityElevated">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-reality-text-primary">{item.label}</p>
              <p className="mt-1 text-sm text-reality-text-quaternary">{item.entity_type}</p>
            </div>
            <span className="shrink-0 text-xs text-reality-text-quaternary">
              <ApplicationDate value={item.occurred_at} />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BuyerApplicationsAndRequests({ overview }: { overview?: DashboardOverview }) {
  const cards = [
    ...(overview?.applications ?? []).map((item) => ({ item, type: "application" as const })),
    ...(overview?.inquiries ?? []).map((item) => ({ item, type: "inquiry" as const })),
    ...(overview?.viewings ?? []).map((item) => ({ item, type: "viewing" as const })),
  ].slice(0, 4);

  if (cards.length === 0) {
    return (
      <EmptyDashboardState>
        Applications and requests will appear here after you show interest, request a viewing, or
        submit an application.
      </EmptyDashboardState>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-6">
        {cards.map(({ item, type }) => (
          <ApplicationRequestCard
            href={type === "application" ? `/dashboard/applications/${item.id}` : undefined}
            item={item}
            key={`${type}-${item.id}`}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

function BuyerDashboard({
  dashboardQuery,
  overview,
}: {
  dashboardQuery: ReturnType<typeof useQuery<DashboardOverview>>;
  overview?: DashboardOverview;
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const showOverview = activeTab === "overview";
  const showRequests = activeTab === "overview" || activeTab === "requests";
  const showSaved = activeTab === "overview" || activeTab === "saved";
  const showViewed = activeTab === "overview" || activeTab === "viewed";
  const showActivity = activeTab === "overview" || activeTab === "activity";

  return (
    <main className="min-h-screen bg-white pb-20 pt-8 text-reality-text-primary [color-scheme:light] lg:pt-10">
      <PageContainer>
        <div className="flex items-center justify-between gap-4">
          <Link
            className="text-sm font-medium text-reality-text-tertiary transition hover:text-reality-brand-600"
            href="/properties"
          >
            Back
          </Link>
          <Link className={buttonClasses("realitySecondary", "h-10 px-5")} href="/properties">
            Explore properties
          </Link>
        </div>

        <section className="mt-8">
          <h1 className="text-4xl font-medium leading-[44px] text-reality-text-primary">
            Hi, {user?.first_name || "there"}
          </h1>
          <p className="mt-2 text-xl leading-7 text-reality-text-secondary">Welcome back!</p>
        </section>

        <div className="mt-10 overflow-x-auto pb-1">
          <SegmentedTabs
            className="min-w-max border border-reality-border-secondary bg-reality-bg-muted p-1.5 shadow-reality-xs"
            items={buyerDashboardTabs}
            label="Buyer dashboard sections"
            onChange={setActiveTab}
            value={activeTab}
          />
        </div>

        {dashboardQuery.isError ? (
          <FormMessage className="mt-6" tone="error" variant="reality">
            Dashboard stats could not be loaded.
          </FormMessage>
        ) : null}

        <div className="reality-reveal">
          {showOverview ? (
            <section className="mt-8">
              <BuyerSectionHeader description="Your dashboard Summary" title="Overview" />
              <div className="mt-6">
                <BuyerMetricGrid isLoading={dashboardQuery.isLoading} overview={overview} />
              </div>
            </section>
          ) : null}
        </div>

        {showRequests ? (
          <section className="mt-16">
            <BuyerSectionHeader title="Applications & Requests" />
            <div className="mt-8">
              <BuyerApplicationsAndRequests overview={overview} />
            </div>
          </section>
        ) : null}

        {showSaved ? (
          <section className="mt-16">
            <BuyerSectionHeader
              description="Properties you showed interest in"
              title="Saved Property"
              action={
                <Link
                  className={buttonClasses("realitySecondary", "h-10 px-5")}
                  href="/saved-properties"
                >
                  View all
                </Link>
              }
            />
            <div className="mt-8">
              <DashboardPropertyRail
                empty="Saved properties will appear here after you shortlist homes from the marketplace."
                properties={overview?.savedProperties ?? []}
              />
            </div>
          </section>
        ) : null}

        {showViewed ? (
          <section className="mt-16">
            <BuyerSectionHeader
              description="Property you view recently"
              title="Recently viewed property"
            />
            <div className="mt-8">
              <DashboardPropertyRail
                empty="Recently viewed properties will appear as you browse the marketplace."
                properties={overview?.recentlyViewed ?? []}
              />
            </div>
          </section>
        ) : null}

        {showOverview ? (
          <section className="mt-16">
            <BuyerSectionHeader
              description="Browse more RealityNG listings matched from current marketplace data."
              title="Recommended properties"
              action={
                <Link className={buttonClasses("reality", "h-10 px-5")} href="/properties">
                  Browse
                </Link>
              }
            />
            <div className="mt-8">
              <DashboardPropertyRail
                empty="Recommendations will appear as marketplace data becomes available."
                properties={overview?.recommendedProperties ?? []}
              />
            </div>
          </section>
        ) : null}

        {showActivity ? (
          <section className="mt-16">
            <BuyerSectionHeader
              description="Recent saves, requests, applications, and workflow updates."
              title="Activity"
            />
            <div className="mt-8">
              <BuyerActivityFeed activity={overview?.activity ?? []} />
            </div>
          </section>
        ) : null}
      </PageContainer>
    </main>
  );
}

const supplyDashboardTabs = [
  { label: "Overview", value: "overview" },
  { label: "Applications", value: "applications" },
  { label: "My Property", value: "properties" },
  { label: "Messages", value: "messages" },
  { label: "Profile", value: "profile" },
];

const supplyNavigationLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Supply-side overview for approved agents and landlords.",
  },
  {
    href: "/properties/new",
    label: "Add Property",
    description: "Create a draft listing using the existing property flow.",
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    description: "Review inquiries and pipeline stages.",
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    description: "Continue conversations with buyers and tenants.",
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    description: "Open supported transaction and escrow workflows.",
  },
  {
    href: "/settings/profile",
    label: "Profile",
    description: "Keep account and contact details current.",
  },
];

type SupplyRequestPreviewItem =
  | { type: "application"; item: RentalApplication }
  | { type: "inquiry"; item: Inquiry }
  | { type: "viewing"; item: Viewing };

function supplyRequestHref(request: SupplyRequestPreviewItem) {
  if (request.type === "inquiry") {
    return `/dashboard/leads/${request.item.id}`;
  }
  if (request.type === "viewing") {
    return `/dashboard/messages?viewing=${request.item.id}`;
  }
  return undefined;
}

function buildSupplyRequests(overview?: DashboardOverview): SupplyRequestPreviewItem[] {
  return [
    ...(overview?.receivedApplications ?? []).map((item) => ({
      type: "application" as const,
      item,
    })),
    ...(overview?.leads ?? []).map((item) => ({ type: "inquiry" as const, item })),
    ...(overview?.receivedViewings ?? []).map((item) => ({ type: "viewing" as const, item })),
  ].sort((a, b) => {
    return new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime();
  });
}

function SupplyMetricGrid({
  isLoading,
  overview,
}: {
  isLoading: boolean;
  overview?: DashboardOverview;
}) {
  const metricCards = [
    {
      icon: "file" as const,
      label: "Active listing",
      value: metricValue(overview?.metrics, "Active listings"),
      detail: "Approved listings visible to buyers and tenants.",
    },
    {
      icon: "check" as const,
      label: "Received applications",
      value: metricValue(overview?.metrics, "Received applications"),
      detail: "Applications submitted on your properties.",
    },
    {
      icon: "headset" as const,
      label: "Property inquiries",
      value: metricValue(overview?.metrics, "Property inquiries"),
      detail: "Buyer or tenant inquiries awaiting follow-up.",
    },
    {
      icon: "heart" as const,
      label: "Viewing requests",
      value: metricValue(overview?.metrics, "Viewing requests"),
      detail: "Requested or scheduled property viewings.",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <MetricCard
          className="rounded-[24px] border-[#f0f0f0] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.04)]"
          detail={metric.detail}
          icon={<DashboardIcon type={metric.icon} />}
          key={metric.label}
          label={metric.label}
          loading={isLoading}
          value={metric.value}
        />
      ))}
    </div>
  );
}

function SupplyApplicationsAndRequests({ overview }: { overview?: DashboardOverview }) {
  const requests = buildSupplyRequests(overview).slice(0, 4);
  const receivedViewings = overview?.receivedViewings ?? [];

  if (requests.length === 0) {
    return (
      <EmptyDashboardState>
        No applications, inquiries, or viewing requests yet. New buyer activity will appear here.
      </EmptyDashboardState>
    );
  }

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-6">
          {requests.map((request) => (
            <ApplicationRequestCard
              href={supplyRequestHref(request)}
              item={request.item}
              key={`${request.type}-${request.item.id}`}
              type={request.type}
            />
          ))}
        </div>
      </div>
      {receivedViewings.length > 0 ? (
        <section aria-label="Viewing request management">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-reality-text-primary">Viewing management</h3>
            <p className="mt-1 text-sm text-reality-text-secondary">
              Confirm, reschedule, complete, or cancel viewing requests when your property
              permissions allow it.
            </p>
          </div>
          <ViewingRequestsManager viewings={receivedViewings} />
        </section>
      ) : null}
    </div>
  );
}

function SupplyMessagePreview({
  isLoading,
  threads,
}: {
  isLoading: boolean;
  threads?: ConversationThread[];
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <Card
            className="h-[88px] animate-pulse rounded-[24px] border-reality-border-secondary bg-reality-bg-subtle"
            key={item}
            variant="realityElevated"
          />
        ))}
      </div>
    );
  }

  const visibleThreads = (threads ?? []).slice(0, 4);
  if (visibleThreads.length === 0) {
    return <EmptyDashboardState>No messages yet. Buyer conversations will appear here.</EmptyDashboardState>;
  }

  return (
    <div className="space-y-3">
      {visibleThreads.map((thread) => (
        <Link
          className="flex items-center justify-between gap-4 rounded-[24px] border border-reality-border-secondary bg-white p-4 shadow-[0_20px_17px_rgba(0,0,0,0.04)] transition hover:border-reality-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          href={`/dashboard/messages/${thread.id}`}
          key={thread.id}
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reality-bg-muted text-sm font-semibold text-reality-text-secondary">
              {(thread.last_message?.sender ?? thread.created_by ?? "R").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-medium leading-7 text-reality-text-primary">
                Conversation
              </p>
              <p className="truncate text-sm leading-5 text-reality-text-secondary">
                {thread.last_message?.body ?? "No messages yet"}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-reality-text-secondary">
              <ApplicationDate value={thread.last_message?.created_at ?? thread.updated_at} />
            </p>
            {thread.unread_count > 0 ? (
              <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#bc8936] px-2 text-xs font-semibold text-white">
                {thread.unread_count}
              </span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function SupplyDashboardBody({
  dashboardQuery,
  managedPropertiesQuery,
  messageQuery,
  overview,
}: {
  dashboardQuery: ReturnType<typeof useQuery<DashboardOverview>>;
  managedPropertiesQuery: ReturnType<typeof useQuery<PaginatedProperties>>;
  messageQuery: ReturnType<typeof useQuery<ConversationThread[]>>;
  overview?: DashboardOverview;
}) {
  return (
    <div>
      {dashboardQuery.isError ? (
        <FormMessage className="mt-6" tone="error" variant="reality">
          Dashboard stats could not be loaded. Some sections may be unavailable.
        </FormMessage>
      ) : null}

      <section className="mt-8">
        <BuyerSectionHeader description="Your dashboard Summary" title="Overview" />
        <div className="mt-6">
          <SupplyMetricGrid isLoading={dashboardQuery.isLoading} overview={overview} />
        </div>
      </section>

      <section className="mt-16">
        <BuyerSectionHeader title="Applications & Requests" />
        <div className="mt-8">
          <SupplyApplicationsAndRequests overview={overview} />
        </div>
      </section>

      <section className="mt-16">
        <BuyerSectionHeader
          action={
            <Link className={buttonClasses("reality", "h-10 px-5")} href="/dashboard/properties">
              View all
            </Link>
          }
          description="Manage properties you own or represent"
          title="My Property"
        />
        <div className="mt-8">
          <SupplyManagedPropertyRail
            empty={
              managedPropertiesQuery.isError
                ? "Managed properties could not be loaded."
                : "You haven't added or been assigned any properties yet."
            }
            isError={managedPropertiesQuery.isError}
            isLoading={managedPropertiesQuery.isLoading}
            properties={managedPropertiesQuery.data?.results.slice(0, 4) ?? []}
          />
        </div>
      </section>

      <section className="mt-16">
        <BuyerSectionHeader
          action={
            <Link className={buttonClasses("realitySecondary", "h-10 px-5")} href="/dashboard/messages">
              View all
            </Link>
          }
          description="Recent conversations with buyers and tenants"
          title="Message"
        />
        <div className="mt-8">
          <SupplyMessagePreview isLoading={messageQuery.isLoading} threads={messageQuery.data} />
        </div>
        {messageQuery.isError ? (
          <FormMessage className="mt-4" tone="error" variant="reality">
            Messages could not be loaded.
          </FormMessage>
        ) : null}
      </section>

      <section className="mt-16">
        <BuyerSectionHeader
          action={
            <Link className={buttonClasses("realitySecondary", "h-10 px-5")} href="/saved-properties">
              View all
            </Link>
          }
          description="Properties you saved"
          title="Saved Property"
        />
        <div className="mt-8">
          <DashboardPropertyRail
            empty="Saved properties will appear here if this supply account saves marketplace listings."
            properties={overview?.savedProperties ?? []}
          />
        </div>
      </section>

      <section className="mt-16">
        <BuyerSectionHeader
          description="Property you view recently"
          title="Recently viewed property"
        />
        <div className="mt-8">
          <DashboardPropertyRail
            empty="Recently viewed properties will appear as this account browses the marketplace."
            properties={overview?.recentlyViewed ?? []}
          />
        </div>
      </section>
    </div>
  );
}

function SupplyDashboardShell({
  dashboardQuery,
  firstName,
  managedPropertiesQuery,
  messageQuery,
  overview,
}: {
  dashboardQuery: ReturnType<typeof useQuery<DashboardOverview>>;
  firstName?: string;
  managedPropertiesQuery: ReturnType<typeof useQuery<PaginatedProperties>>;
  messageQuery: ReturnType<typeof useQuery<ConversationThread[]>>;
  overview?: DashboardOverview;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const showOverview = activeTab === "overview";
  const showApplications = activeTab === "overview" || activeTab === "applications";
  const showProperties = activeTab === "overview" || activeTab === "properties";
  const showMessages = activeTab === "overview" || activeTab === "messages";
  const showProfile = activeTab === "overview" || activeTab === "profile";

  return (
    <main className="min-h-screen bg-white pb-20 pt-8 text-reality-text-primary [color-scheme:light] lg:pt-10">
      <PageContainer>
        <div className="flex items-center justify-between gap-4">
          <Link
            className="text-sm font-medium text-reality-text-tertiary transition hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link className={buttonClasses("reality", "h-10 px-5")} href="/properties/new">
            Add Property
          </Link>
        </div>

        <section className="mt-8">
          <h1 className="text-4xl font-medium leading-[44px] text-reality-text-primary">
            Hi, {firstName || "there"}
          </h1>
          <p className="mt-2 text-xl leading-7 text-reality-text-secondary">
            Manage properties you own or represent.
          </p>
        </section>

        <div className="mt-10 overflow-x-auto pb-1">
          <SegmentedTabs
            className="min-w-max border border-reality-border-secondary bg-reality-bg-muted p-1.5 shadow-reality-xs"
            items={supplyDashboardTabs}
            label="Agent and landlord dashboard sections"
            onChange={setActiveTab}
            value={activeTab}
          />
        </div>

        {showOverview ? (
          <SupplyDashboardBody
            dashboardQuery={dashboardQuery}
            managedPropertiesQuery={managedPropertiesQuery}
            messageQuery={messageQuery}
            overview={overview}
          />
        ) : null}

        {!showOverview && showApplications ? (
          <section className="mt-8">
            <BuyerSectionHeader title="Applications & Requests" />
            <div className="mt-8">
              <SupplyApplicationsAndRequests overview={overview} />
            </div>
          </section>
        ) : null}

        {!showOverview && showProperties ? (
          <section className="mt-8">
            <BuyerSectionHeader
              action={
                <Link className={buttonClasses("reality", "h-10 px-5")} href="/properties/new">
                  Add Property
                </Link>
              }
              description="Manage properties you own or represent"
              title="My Property"
            />
            <div className="mt-8">
              <SupplyManagedPropertyRail
                empty={
                  managedPropertiesQuery.isError
                    ? "Managed properties could not be loaded."
                    : "You haven't added or been assigned any properties yet."
                }
                isError={managedPropertiesQuery.isError}
                isLoading={managedPropertiesQuery.isLoading}
                properties={managedPropertiesQuery.data?.results.slice(0, 4) ?? []}
              />
            </div>
          </section>
        ) : null}

        {!showOverview && showMessages ? (
          <section className="mt-8">
            <BuyerSectionHeader
              action={
                <Link
                  className={buttonClasses("realitySecondary", "h-10 px-5")}
                  href="/dashboard/messages"
                >
                  View all
                </Link>
              }
              description="Recent conversations with buyers and tenants"
              title="Message"
            />
            <div className="mt-8">
              <SupplyMessagePreview isLoading={messageQuery.isLoading} threads={messageQuery.data} />
            </div>
          </section>
        ) : null}

        {!showOverview && showProfile ? (
          <section className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {supplyNavigationLinks.map((link) => (
                <Link
                  className="group rounded-reality border border-reality-border-secondary bg-white p-5 shadow-reality-xs transition hover:-translate-y-0.5 hover:border-reality-brand-300 hover:shadow-reality-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                  href={link.href}
                  key={link.href}
                >
                  <p className="text-base font-semibold text-reality-text-primary transition group-hover:text-reality-brand-700">
                    {link.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </PageContainer>
    </main>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview", user?.id],
    queryFn: () => getDashboardOverview(user),
  });
  const messageQuery = useQuery({
    enabled: isApprovedSupplyUser(user),
    queryKey: ["message-threads", "supply-dashboard", user?.id],
    queryFn: listThreads,
  });
  const managedPropertiesQuery = useQuery({
    enabled: isApprovedSupplyUser(user),
    queryKey: ["managed-properties", "supply-dashboard", user?.id],
    queryFn: () => listManagedProperties({ ordering: "-created_at" }),
  });
  const overview = dashboardQuery.data;
  const isSupplyUser = isApprovedSupplyUser(user);
  const isAdminUser = isAdmin(user) || overview?.role === "admin";
  const dashboardLabel = isAdminUser
    ? "Admin operations"
    : isSupplyUser
      ? "Owner and agent workspace"
      : "Buyer and tenant workspace";
  const dashboardDescription = isAdminUser
    ? "Review marketplace operations, verification queues, and platform activity."
    : isSupplyUser
      ? "Manage listings, leads, viewings, applications, and verification from one place."
      : "Track saved properties, inquiries, viewings, applications, and next actions.";
  const primaryActions = isAdminUser
    ? adminActionLinks
    : isSupplyUser
      ? supplyActionLinks
      : buyerActionLinks;

  if (!isAdminUser && !isSupplyUser) {
    return <BuyerDashboard dashboardQuery={dashboardQuery} overview={overview} />;
  }

  if (isSupplyUser && !isAdminUser) {
    return (
      <SupplyDashboardShell
        dashboardQuery={dashboardQuery}
        firstName={user?.first_name}
        managedPropertiesQuery={managedPropertiesQuery}
        messageQuery={messageQuery}
        overview={overview}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
      <section className="rounded-md border border-reality-border-secondary bg-white/70 p-5 shadow-reality-sm sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-reality-brand-600">
              {dashboardLabel}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-reality-text-primary md:text-4xl">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-reality-text-secondary">{dashboardDescription}</p>
          </div>
          <div className="rounded-md border border-brand-secondary/25 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
              Next best actions
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {primaryActions.slice(0, 3).map((action) => (
                <Link
                  className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 py-2 text-sm font-semibold text-reality-text-primary transition hover:border-brand-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
                  href={action.href}
                  key={action.href}
                >
                  {action.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <MetricGrid isLoading={dashboardQuery.isLoading} metrics={overview?.metrics ?? []} />
      </section>
      {dashboardQuery.isError ? (
        <Card className="mt-4 p-4 text-sm text-red-200">Dashboard stats could not be loaded.</Card>
      ) : null}

      {!isAdminUser ? (
        <section className="mt-10">
          <SectionHeader
            description="The marketplace journey stays connected from discovery to decision, so you can return to the right step quickly."
            eyebrow="Transaction lifecycle"
            title={isSupplyUser ? "Pipeline visibility" : "Your property journey"}
          />
          <div className="mt-5">
            <BuyerJourneySummary
              metrics={overview?.metrics}
              variant={isSupplyUser ? "supply" : "buyer"}
            />
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionHeader
          description="Use these shortcuts for the tasks that should happen after a user has signed in."
          eyebrow="Workspace shortcuts"
          title="Continue where you left off"
        />
        <div className="mt-5">
          <ActionGrid actions={primaryActions} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
              Current transaction status
            </h2>
            <p className="mt-1 text-sm text-reality-text-secondary">
              Follow each property from inquiry through viewing, application, and decision.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <TransactionCenter transactions={overview?.transactions ?? []} />
        </div>
      </section>

      {isAdminUser ? (
        <>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Admin review queues
              </h2>
              <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                Verification, listing moderation, and platform activity stay separated from normal
                user dashboards.
              </p>
              <div className="mt-5 grid gap-3">
                {overview?.pendingApprovals.slice(0, 4).map((property) => (
                  <Link
                    className="rounded-md border border-reality-border-secondary p-4 transition hover:border-brand-secondary/60"
                    href={`/properties/${property.slug}`}
                    key={property.id}
                  >
                    <p className="font-semibold text-reality-text-primary">{property.title}</p>
                    <p className="mt-1 text-sm text-reality-text-secondary">
                      {property.city}, {property.state}
                    </p>
                  </Link>
                ))}
                {(overview?.pendingApprovals.length ?? 0) === 0 ? (
                  <p className="rounded-md border border-reality-border-secondary p-4 text-sm text-reality-text-secondary">
                    No listing approvals are waiting in this dashboard summary.
                  </p>
                ) : null}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                User statistics
              </h2>
              <div className="mt-5 grid gap-4">
                {(overview?.userStats ?? []).map((metric) => (
                  <div className="rounded-md bg-reality-bg-subtle p-4" key={metric.label}>
                    <p className="text-sm text-reality-text-secondary">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-reality-brand-600">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-reality-text-secondary">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Recent activity
              </h2>
              <div className="mt-5">
                <ActivityFeed activity={overview?.activity ?? []} />
              </div>
            </Card>
            <NotificationCenterPlaceholder />
          </section>
        </>
      ) : isSupplyUser ? (
        <>
          <section className="mt-10">
            <SectionHeader
              description="Keep your approved inventory visible and move buyers through the workflow."
              title="Listing inventory"
            />
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(overview?.activeListings ?? []).slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {(overview?.activeListings.length ?? 0) === 0 ? (
              <Card className="mt-5 p-5 text-sm text-reality-text-secondary">
                Your active listings will appear here after approval. Create a draft listing to get
                started.
              </Card>
            ) : null}
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Property inquiries
              </h2>
              <div className="mt-5">
                <PropertyInquiryManager inquiries={overview?.leads ?? []} />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Conversion metrics
              </h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-md bg-reality-bg-subtle p-4">
                  <p className="text-sm text-reality-text-secondary">Active leads</p>
                  <p className="mt-2 text-3xl font-semibold text-reality-brand-600">
                    {overview?.leads.length ?? 0}
                  </p>
                </div>
                <div className="rounded-md bg-reality-bg-subtle p-4">
                  <p className="text-sm text-reality-text-secondary">Viewing requests</p>
                  <p className="mt-2 text-3xl font-semibold text-reality-brand-600">
                    {overview?.receivedViewings.length ?? 0}
                  </p>
                </div>
                <div className="rounded-md bg-reality-bg-subtle p-4">
                  <p className="text-sm text-reality-text-secondary">Pending applications</p>
                  <p className="mt-2 text-3xl font-semibold text-reality-brand-600">
                    {
                      (overview?.receivedApplications ?? []).filter((item) =>
                        ["submitted", "under_review"].includes(item.status),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Viewing requests
              </h2>
              <div className="mt-5">
                <ViewingRequestsManager viewings={overview?.receivedViewings ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Received applications
              </h2>
              <div className="mt-5">
                <ReceivedApplicationsManager applications={overview?.receivedApplications ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Recent activity
              </h2>
              <div className="mt-5">
                <ActivityFeed activity={overview?.activity ?? []} />
              </div>
            </Card>
            <NotificationCenterPlaceholder />
          </section>
        </>
      ) : (
        <>
          <section className="mt-10">
            <SectionHeader
              description="Use recommendations as a starting point, then refine your search by city, price, property type, and listing purpose."
              title="Recommended properties"
            />
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {overview?.recommendedProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {(overview?.recommendedProperties.length ?? 0) === 0 ? (
              <Card className="mt-5 p-5 text-sm text-reality-text-secondary">
                Recommendations will appear as you browse and save properties.
              </Card>
            ) : null}
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">My interests</h2>
              <div className="mt-5">
                <MyInterestsList inquiries={overview?.inquiries ?? []} />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">My viewings</h2>
              <div className="mt-5">
                <MyViewingsList viewings={overview?.viewings ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Recently viewed
              </h2>
              <div className="mt-5 space-y-3">
                {overview?.recentlyViewed.slice(0, 5).map((property) => (
                  <Link
                    className="block rounded-md border border-reality-border-secondary p-4 transition hover:border-brand-secondary/60"
                    href={`/properties/${property.slug}`}
                    key={property.id}
                  >
                    <p className="font-semibold text-reality-text-primary">{property.title}</p>
                    <p className="mt-1 text-sm text-reality-text-secondary">
                      {property.city}, {property.state}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                My applications
              </h2>
              <div className="mt-5">
                <MyApplicationsList applications={overview?.applications ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-display text-2xl font-semibold text-reality-text-primary">
                Recent activity
              </h2>
              <div className="mt-5">
                <ActivityFeed activity={overview?.activity ?? []} />
              </div>
            </Card>
            <NotificationCenterPlaceholder />
          </section>
        </>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

