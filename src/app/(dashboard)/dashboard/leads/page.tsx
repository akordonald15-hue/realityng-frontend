"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  formatLeadPipelineStage,
  formatLeadPriority,
  getLeadDashboardSummary,
  leadPipelineStageOptions,
  leadPriorityOptions,
  listLeads,
  type LeadPipelineStage,
  type LeadPriority,
} from "@/lib/api/leads";

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  low: "bg-white/5 text-brand-muted",
  medium: "bg-brand-secondary/10 text-brand-secondary",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

const STAGE_STYLES: Record<LeadPipelineStage, string> = {
  new: "bg-white/5 text-brand-muted",
  contacted: "bg-brand-secondary/10 text-brand-secondary",
  qualified: "bg-brand-secondary/10 text-brand-secondary",
  viewing_scheduled: "bg-amber-500/10 text-amber-400",
  application_started: "bg-amber-500/10 text-amber-400",
  application_submitted: "bg-amber-500/10 text-amber-400",
  negotiating: "bg-amber-500/10 text-amber-400",
  converted: "bg-emerald-500/10 text-emerald-400",
  closed_lost: "bg-red-500/10 text-red-400",
};

export default function LeadInboxPage() {
  const [pipelineStage, setPipelineStage] = useState<LeadPipelineStage | "">("");
  const [priority, setPriority] = useState<LeadPriority | "">("");
  const [search, setSearch] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["lead-dashboard-summary"],
    queryFn: () => getLeadDashboardSummary(),
  });

  const leadsQuery = useQuery({
    queryKey: ["leads", { pipelineStage, priority, search }],
    queryFn: () =>
      listLeads({
        pipeline_stage: pipelineStage || undefined,
        priority: priority || undefined,
        search: search || undefined,
      }),
  });

  const summary = summaryQuery.data;
  const leads = leadsQuery.data?.results ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Lead Inbox"
          description="Track and follow up on every inquiry across your properties."
        />

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-3">
            <p className="text-xs text-brand-muted">New leads</p>
            <p className="text-xl font-semibold text-brand-text">
              {summaryQuery.isLoading ? "…" : (summary?.new_leads ?? 0)}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-brand-muted">Follow-ups due</p>
            <p className="text-xl font-semibold text-brand-text">
              {summaryQuery.isLoading ? "…" : (summary?.upcoming_follow_ups ?? 0)}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-brand-muted">Viewing conversion</p>
            <p className="text-xl font-semibold text-brand-text">
              {summaryQuery.isLoading ? "…" : `${summary?.viewing_conversion_rate ?? 0}%`}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-brand-muted">Converted</p>
            <p className="text-xl font-semibold text-brand-text">
              {summaryQuery.isLoading ? "…" : (summary?.converted_count ?? 0)}
            </p>
          </Card>
        </section>

        <section className="mt-6 flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads…"
            className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted"
          />
          <select
            value={pipelineStage}
            onChange={(event) =>
              setPipelineStage(event.target.value as LeadPipelineStage | "")
            }
            className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All stages</option>
            {leadPipelineStageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as LeadPriority | "")}
            className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All priorities</option>
            {leadPriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="mt-4">
          {leadsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading leads…</p>
          ) : leadsQuery.isError ? (
            <p className="text-sm text-brand-muted">Couldn&apos;t load leads. Try again shortly.</p>
          ) : leads.length > 0 ? (
            <div className="grid gap-3">
              {leads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                  <Card className="flex items-center justify-between p-3 transition hover:bg-white/5">
                    <div>
                      <p className="font-medium text-brand-text">{lead.property.title}</p>
                      <p className="text-sm text-brand-muted">{lead.interested_user.full_name}</p>
                      {lead.assigned_to && (
                        <p className="text-xs text-brand-muted">
                          Assigned to {lead.assigned_to.full_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_STYLES[lead.priority]}`}
                      >
                        {formatLeadPriority(lead.priority)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STAGE_STYLES[lead.pipeline_stage]}`}
                      >
                        {formatLeadPipelineStage(lead.pipeline_stage)}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">No leads match these filters yet.</p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
