"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PropertyCard } from "@/components/properties/property-card";
import { ViewingRequestButton } from "@/components/properties/viewing-request-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
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
import { getDashboardOverview } from "@/lib/api/dashboard";
import {
  formatInquiryStatus,
  inquiryStatusOptions,
  updateInquiryNotes,
  updateInquiryStatus,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/api/inquiries";
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
import { isAdmin, isApprovedProfessional } from "@/lib/auth/permissions";
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
    description: "Monitor projects, stakeholders, progress updates, and inspection-linked milestones.",
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
      <Card className="p-5 text-sm text-brand-muted">
        Your shown interests will appear here after you submit an inquiry from a property page.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.slice(0, 5).map((inquiry) => (
        <div className="rounded-md border border-white/10 p-4" key={inquiry.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{inquiry.property.title}</p>
              <p className="mt-1 text-xs text-brand-muted">
                <InquiryDate value={inquiry.created_at} /> · {inquiry.property.city},{" "}
                {inquiry.property.state}
              </p>
            </div>
            <WorkflowStatusBadge status={inquiry.status}>
              {formatInquiryStatus(inquiry.status)}
            </WorkflowStatusBadge>
          </div>
          {inquiry.message ? (
            <p className="mt-3 text-sm leading-6 text-brand-muted">{inquiry.message}</p>
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
      <Card className="p-5 text-sm text-brand-muted">
        Requested and confirmed property viewings will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewings.slice(0, 5).map((viewing) => (
        <div className="rounded-md border border-white/10 p-4" key={viewing.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{viewing.property.title}</p>
              <p className="mt-1 text-sm text-brand-muted">
                <ViewingDate viewing={viewing} /> - {formatViewingType(viewing.viewing_type)}
              </p>
              {viewing.confirmed_datetime ? (
                <p className="mt-1 text-xs text-brand-muted">
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
            <p className="mt-3 text-sm leading-6 text-brand-muted">{viewing.notes}</p>
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
              className={buttonClasses("primary", "mt-3 h-9")}
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
      <span className={active ? "text-xs text-brand-text" : "text-xs text-brand-muted"}>
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
      <Card className="p-5 text-sm text-brand-muted">
        Active property transactions will appear here as users move from interest to viewing and
        application.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {transactions.slice(0, 6).map((transaction) => (
        <div className="rounded-md border border-white/10 p-4" key={transaction.inquiry_id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{transaction.property.title}</p>
              <p className="mt-1 text-sm text-brand-muted">
                {transaction.property.city}, {transaction.property.state}
              </p>
            </div>
            <WorkflowStatusBadge status={transaction.stage}>
              {transaction.stage_label}
            </WorkflowStatusBadge>
          </div>
          <WorkflowTimeline stage={transaction.stage} />
          <div className="mt-4 rounded-md bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Next action
            </p>
            <p className="mt-1 text-sm text-brand-text">{transaction.next_action}</p>
          </div>
          {transaction.stage === "completed" ? (
            <Link
              className={buttonClasses("primary", "mt-3 h-9")}
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
      <Card className="p-5 text-sm text-brand-muted">
        Activity will appear here as saves, inquiries, viewings, and applications happen.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activity.slice(0, 8).map((item) => (
        <div className="rounded-md border border-white/10 p-4" key={item.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-brand-text">{item.label}</p>
            <span className="text-xs text-brand-muted">
              <ApplicationDate value={item.occurred_at} />
            </span>
          </div>
          <p className="mt-1 text-sm text-brand-muted">{item.entity_type}</p>
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
      <h2 className="font-heading text-2xl font-semibold text-brand-text">Notification center</h2>
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
      <Card className="p-5 text-sm text-brand-muted">
        Rental applications you submit will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.slice(0, 5).map((application) => (
        <div className="rounded-md border border-white/10 p-4" key={application.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{application.property.title}</p>
              <p className="mt-1 text-sm text-brand-muted">
                Submitted <ApplicationDate value={application.created_at} /> - Move-in{" "}
                <ApplicationDate value={application.move_in_date} />
              </p>
            </div>
            <WorkflowStatusBadge status={application.status}>
              {formatApplicationStatus(application.status)}
            </WorkflowStatusBadge>
          </div>
          {application.message ? (
            <p className="mt-3 text-sm leading-6 text-brand-muted">{application.message}</p>
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
      <Card className="p-5 text-sm text-brand-muted">
        Buyer and tenant inquiries for your properties will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.slice(0, 5).map((inquiry) => (
        <div className="rounded-md border border-white/10 p-4" key={inquiry.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{inquiry.interested_user.full_name}</p>
              <p className="mt-1 text-sm text-brand-muted">{inquiry.interested_user.email}</p>
              <p className="mt-2 text-sm text-brand-muted">{inquiry.property.title}</p>
            </div>
            <WorkflowStatusBadge status={inquiry.status}>
              {formatInquiryStatus(inquiry.status)}
            </WorkflowStatusBadge>
          </div>
          {inquiry.message ? (
            <p className="mt-3 text-sm leading-6 text-brand-muted">{inquiry.message}</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
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
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Internal notes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
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
      <Card className="p-5 text-sm text-brand-muted">
        Viewing requests for your properties will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {viewings.slice(0, 5).map((viewing) => (
        <div className="rounded-md border border-white/10 p-4" key={viewing.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{viewing.requester.full_name}</p>
              <p className="mt-1 text-sm text-brand-muted">{viewing.property.title}</p>
              <p className="mt-1 text-xs text-brand-muted">
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
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Confirmed date and time
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  defaultValue={defaultDecisionDateTime(viewing)}
                  name="confirmed_datetime"
                  type="datetime-local"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Meeting location
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                  defaultValue={viewing.meeting_location}
                  name="meeting_location"
                  placeholder="Estate gate, sales office, or reception"
                />
              </label>
            </div>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Meeting link
              </span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                defaultValue={viewing.meeting_link}
                name="meeting_link"
                placeholder="Optional virtual viewing link"
                type="url"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Notes
              </span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                defaultValue={viewing.notes}
                name="notes"
                placeholder="Access instructions, reschedule reason, or private notes"
              />
            </label>
            <div className="flex flex-wrap gap-2">
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
              {viewing.status === "confirmed" ? (
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
              {viewing.status !== "completed" && viewing.status !== "cancelled" ? (
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
        </div>
      ))}
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
      <Card className="p-5 text-sm text-brand-muted">
        Rental applications for your properties will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.slice(0, 5).map((application) => (
        <div className="rounded-md border border-white/10 p-4" key={application.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-text">{application.full_name}</p>
              <p className="mt-1 text-sm text-brand-muted">{application.email}</p>
              <p className="mt-2 text-sm text-brand-muted">{application.property.title}</p>
              <p className="mt-1 text-xs text-brand-muted">
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
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  Owner notes
                </span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text outline-none transition placeholder:text-brand-muted/60 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
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
  const labelSet = new Set((Array.isArray(labels) ? labels : [labels]).map((label) => label.toLowerCase()));
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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
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
          <p className="text-sm text-brand-muted">{item.label}</p>
          <p className="mt-3 font-heading text-4xl font-semibold text-brand-secondary">
            {isLoading ? "-" : item.value}
          </p>
          <p className="mt-2 text-xs leading-5 text-brand-muted">{item.detail}</p>
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
          <Card className="h-full p-5 transition group-hover:border-brand-secondary/60 group-focus-visible:ring-2 group-focus-visible:ring-brand-secondary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand-background">
            <h3 className="text-base font-semibold text-brand-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Step {index + 1}
          </span>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="font-heading text-xl font-semibold text-brand-text">{stage.label}</p>
            <p className="font-heading text-3xl font-semibold text-brand-secondary">
              {stage.value}
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-brand-muted">{stage.description}</p>
        </Card>
      ))}
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview", user?.id],
    queryFn: () => getDashboardOverview(user),
  });
  const overview = dashboardQuery.data;
  const isAgent = isApprovedProfessional(user);
  const isAdminUser = isAdmin(user) || overview?.role === "admin";
  const isSupplyUser = isAgent || overview?.role === "agent";
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

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">
      <section className="rounded-md border border-white/10 bg-brand-surface/70 p-5 shadow-glow sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
              {dashboardLabel}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-text md:text-4xl">
              Welcome back{user?.first_name ? `, ${user.first_name}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-brand-muted">{dashboardDescription}</p>
          </div>
          <div className="rounded-md border border-brand-secondary/25 bg-brand-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Next best actions
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {primaryActions.slice(0, 3).map((action) => (
                <Link
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-brand-text transition hover:border-brand-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
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
            <BuyerJourneySummary metrics={overview?.metrics} variant={isSupplyUser ? "supply" : "buyer"} />
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
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              Current transaction status
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
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
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Admin review queues
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Verification, listing moderation, and platform activity stay separated from normal
                user dashboards.
              </p>
              <div className="mt-5 grid gap-3">
                {overview?.pendingApprovals.slice(0, 4).map((property) => (
                  <Link
                    className="rounded-md border border-white/10 p-4 transition hover:border-brand-secondary/60"
                    href={`/properties/${property.slug}`}
                    key={property.id}
                  >
                    <p className="font-semibold text-brand-text">{property.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {property.city}, {property.state}
                    </p>
                  </Link>
                ))}
                {(overview?.pendingApprovals.length ?? 0) === 0 ? (
                  <p className="rounded-md border border-white/10 p-4 text-sm text-brand-muted">
                    No listing approvals are waiting in this dashboard summary.
                  </p>
                ) : null}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                User statistics
              </h2>
              <div className="mt-5 grid gap-4">
                {(overview?.userStats ?? []).map((metric) => (
                  <div className="rounded-md bg-white/5 p-4" key={metric.label}>
                    <p className="text-sm text-brand-muted">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-brand-secondary">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-brand-muted">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
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
              <Card className="mt-5 p-5 text-sm text-brand-muted">
                Your active listings will appear here after approval. Create a draft listing to get
                started.
              </Card>
            ) : null}
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Property inquiries
              </h2>
              <div className="mt-5">
                <PropertyInquiryManager inquiries={overview?.leads ?? []} />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Conversion metrics
              </h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Active leads</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">
                    {overview?.leads.length ?? 0}
                  </p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Viewing requests</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">
                    {overview?.receivedViewings.length ?? 0}
                  </p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Pending applications</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">
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
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Viewing requests
              </h2>
              <div className="mt-5">
                <ViewingRequestsManager viewings={overview?.receivedViewings ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Received applications
              </h2>
              <div className="mt-5">
                <ReceivedApplicationsManager applications={overview?.receivedApplications ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
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
              <Card className="mt-5 p-5 text-sm text-brand-muted">
                Recommendations will appear as you browse and save properties.
              </Card>
            ) : null}
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">My interests</h2>
              <div className="mt-5">
                <MyInterestsList inquiries={overview?.inquiries ?? []} />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">My viewings</h2>
              <div className="mt-5">
                <MyViewingsList viewings={overview?.viewings ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Recently viewed
              </h2>
              <div className="mt-5 space-y-3">
                {overview?.recentlyViewed.slice(0, 5).map((property) => (
                  <Link
                    className="block rounded-md border border-white/10 p-4 transition hover:border-brand-secondary/60"
                    href={`/properties/${property.slug}`}
                    key={property.id}
                  >
                    <p className="font-semibold text-brand-text">{property.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {property.city}, {property.state}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </section>
          <section className="mt-10">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                My applications
              </h2>
              <div className="mt-5">
                <MyApplicationsList applications={overview?.applications ?? []} />
              </div>
            </Card>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
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
  return (
    <DashboardContent />
  );
}
