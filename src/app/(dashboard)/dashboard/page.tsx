"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PropertyCard } from "@/components/properties/property-card";
import { ViewingRequestButton } from "@/components/properties/viewing-request-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
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
import { isApprovedProfessional } from "@/lib/auth/permissions";
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
            <Badge variant="muted">{formatInquiryStatus(inquiry.status)}</Badge>
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
            <Badge variant="muted">{formatViewingStatus(viewing.status)}</Badge>
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
            <Badge variant="muted">{formatInquiryStatus(inquiry.status)}</Badge>
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
            <Badge variant="muted">{formatViewingStatus(viewing.status)}</Badge>
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

function DashboardContent() {
  const { user } = useAuth();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-overview", user?.id],
    queryFn: () => getDashboardOverview(user),
  });
  const overview = dashboardQuery.data;
  const isAgent = isApprovedProfessional(user);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">
          {overview?.role === "agent" ? "Agent dashboard" : "Buyer dashboard"}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-brand-text">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ""}.
        </h1>
        <p className="mt-2 text-brand-muted">
          {isAgent
            ? "Track listing performance, leads, views, and conversion activity."
            : "Review saved properties, recent activity, inquiries, and recommendations."}
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(overview?.metrics ?? []).map((item) => (
          <Card className="p-5" key={item.label}>
            <p className="text-sm text-brand-muted">{item.label}</p>
            <p className="mt-3 font-heading text-4xl font-semibold text-brand-secondary">
              {dashboardQuery.isLoading ? "-" : item.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-brand-muted">{item.detail}</p>
          </Card>
        ))}
      </div>
      {dashboardQuery.isError ? (
        <Card className="mt-4 p-4 text-sm text-red-200">Dashboard stats could not be loaded.</Card>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {dashboardLinks.map((item) => (
          <Link className="group block focus:outline-none" href={item.href} key={item.href}>
            <Card className="h-full p-5 transition group-hover:border-brand-secondary/60 group-focus-visible:ring-2 group-focus-visible:ring-brand-secondary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-brand-background">
              <h2 className="text-lg font-semibold text-brand-text">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
            </Card>
          </Link>
        ))}
      </div>
      {overview?.role === "agent" ? (
        <>
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">Active listings</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {overview.activeListings.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
          <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Property inquiries
              </h2>
              <div className="mt-5">
                <PropertyInquiryManager inquiries={overview.leads} />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-heading text-2xl font-semibold text-brand-text">
                Conversion metrics
              </h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Inquiry response rate</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">94%</p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Average days to negotiation</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">6.4</p>
                </div>
                <div className="rounded-md bg-white/5 p-4">
                  <p className="text-sm text-brand-muted">Projected monthly commission</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-secondary">NGN 18.5M</p>
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
                <ViewingRequestsManager viewings={overview.receivedViewings} />
              </div>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              Recommended properties
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {overview?.recommendedProperties.slice(0, 4).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
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
        </>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
