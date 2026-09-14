"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { PageContainer } from "@/components/layout/page-container";
import { Select } from "@/components/ui/select";
import { StatusChip } from "@/components/ui/status-chip";
import {
  formatLeadPipelineStage,
  formatLeadPriority,
  getLeadDashboardSummary,
  leadPipelineStageOptions,
  leadPriorityOptions,
  listLeads,
  type Lead,
  type LeadPipelineStage,
  type LeadPriority,
} from "@/lib/api/leads";
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

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function LeadSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card className="animate-pulse p-5" key={index} variant="reality">
          <div className="h-5 w-2/5 rounded-full bg-reality-bg-muted" />
          <div className="mt-3 h-4 w-3/5 rounded-full bg-reality-bg-muted" />
          <div className="mt-5 flex gap-2">
            <div className="h-7 w-24 rounded-full bg-reality-bg-muted" />
            <div className="h-7 w-20 rounded-full bg-reality-bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link
      className="group block rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      href={`/dashboard/leads/${lead.id}`}
    >
      <Card
        className="p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-reality-brand-500/30 group-hover:shadow-reality-sm"
        variant="reality"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-reality-brand-600">
              {lead.source || "Property inquiry"}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-reality-text-primary">
              {lead.property.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-reality-text-secondary">
              {lead.interested_user.full_name} asked about {lead.property.city}, {lead.property.state}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <StatusChip tone={stageTone[lead.pipeline_stage]}>
              Stage: {formatLeadPipelineStage(lead.pipeline_stage)}
            </StatusChip>
            <StatusChip tone={priorityTone[lead.priority]}>
              Priority: {formatLeadPriority(lead.priority)}
            </StatusChip>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-reality-border-secondary pt-4 text-sm text-reality-text-secondary md:grid-cols-3">
          <p>
            <span className="block text-xs font-medium uppercase tracking-[0.08em] text-reality-text-quaternary">
              Assigned
            </span>
            {lead.assigned_to?.full_name ?? "Unassigned"}
          </p>
          <p>
            <span className="block text-xs font-medium uppercase tracking-[0.08em] text-reality-text-quaternary">
              Follow-up
            </span>
            {formatDate(lead.next_follow_up_at)}
          </p>
          <p>
            <span className="block text-xs font-medium uppercase tracking-[0.08em] text-reality-text-quaternary">
              Received
            </span>
            {formatDate(lead.created_at)}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export default function LeadInboxPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [pipelineStage, setPipelineStage] = useState<LeadPipelineStage | "">("");
  const [priority, setPriority] = useState<LeadPriority | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const canViewSupplyCrm = authLoading || isAdmin(user) || isApprovedSupplyUser(user);

  const filters = useMemo(
    () => ({
      pipeline_stage: pipelineStage || undefined,
      priority: priority || undefined,
      search: search || undefined,
    }),
    [pipelineStage, priority, search],
  );

  const summaryQuery = useQuery({
    queryKey: ["lead-dashboard-summary"],
    queryFn: () => getLeadDashboardSummary(),
    enabled: canViewSupplyCrm,
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", filters],
    queryFn: () => listLeads(filters),
    enabled: canViewSupplyCrm,
  });

  const summary = summaryQuery.data;
  const leads = leadsQuery.data?.results ?? [];
  const hasActiveFilters = Boolean(search || pipelineStage || priority);

  return (
    <ProtectedRoute>
      <PageContainer className="py-10">
        {!canViewSupplyCrm ? (
          <Card className="p-8" variant="reality">
            <p className="text-sm font-semibold text-reality-text-primary">Leads are not available for this account.</p>
            <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
              Lead management is available to approved supply-side users with access to relevant properties.
            </p>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-reality-brand-600">Dashboard &gt; Leads</p>
                <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-reality-text-primary">
                  Leads
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-reality-text-secondary">
                  Manage property enquiries, follow-up activity, and CRM stage changes from real inquiry data.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPipelineStage("");
                  setPriority("");
                }}
                variant="realitySecondary"
              >
                Clear filters
              </Button>
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                detail="All enquiry-backed leads"
                label="Total leads"
                loading={summaryQuery.isLoading}
                value={summary?.total_leads ?? 0}
              />
              <MetricCard
                detail="New pipeline stage"
                label="New leads"
                loading={summaryQuery.isLoading}
                value={summary?.new_leads ?? 0}
              />
              <MetricCard
                detail="Scheduled follow-ups"
                label="Follow-ups"
                loading={summaryQuery.isLoading}
                value={summary?.upcoming_follow_ups ?? 0}
              />
              <MetricCard
                detail="Converted pipeline stage"
                label="Converted"
                loading={summaryQuery.isLoading}
                value={summary?.converted_count ?? 0}
              />
            </section>

            <Card className="mt-6 p-5" variant="reality">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                    Search
                  </span>
                  <Input
                    aria-label="Search leads"
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSearch(searchInput.trim());
                    }}
                    placeholder="Search customer, email, or property"
                    value={searchInput}
                    variant="reality"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                    Stage
                  </span>
                  <Select
                    aria-label="Filter leads by stage"
                    onChange={(event) => setPipelineStage(event.target.value as LeadPipelineStage | "")}
                    value={pipelineStage}
                    variant="reality"
                  >
                    <option value="">All stages</option>
                    {leadPipelineStageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-reality-text-quaternary">
                    Priority
                  </span>
                  <Select
                    aria-label="Filter leads by priority"
                    onChange={(event) => setPriority(event.target.value as LeadPriority | "")}
                    value={priority}
                    variant="reality"
                  >
                    <option value="">All priorities</option>
                    {leadPriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="flex items-end">
                  <Button
                    className="w-full lg:w-auto"
                    onClick={() => setSearch(searchInput.trim())}
                    variant="reality"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </Card>

            <section className="mt-6">
              {leadsQuery.isLoading ? (
                <LeadSkeleton />
              ) : leadsQuery.isError ? (
                <Card className="p-6" variant="reality">
                  <p className="font-semibold text-reality-text-primary">Couldn&apos;t load leads.</p>
                  <p className="mt-2 text-sm leading-6 text-reality-text-secondary">
                    This is different from having no leads. Retry once the connection is stable.
                  </p>
                  <Button className="mt-4" onClick={() => void leadsQuery.refetch()} variant="realitySecondary">
                    Retry
                  </Button>
                </Card>
              ) : leads.length > 0 ? (
                <div className="grid gap-4">
                  {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center" variant="reality">
                  <h2 className="text-xl font-semibold text-reality-text-primary">
                    {hasActiveFilters ? "No leads match these filters." : "No enquiries yet."}
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-reality-text-secondary">
                    {hasActiveFilters
                      ? "Try clearing the search, stage, or priority filters."
                      : "New enquiries about properties you own or manage will appear here."}
                  </p>
                </Card>
              )}
            </section>
          </>
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}

