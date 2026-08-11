"use client";

import Link from "next/link";

import { ConstructionStatusBadge } from "@/components/construction/construction-status-badge";
import {
  ActivityTimeline,
  DashboardSection,
  DashboardStatGrid,
  EmptyDashboardState,
} from "@/components/services/services-dashboard-widgets";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  ConstructionDashboard,
  ConstructionMilestone,
  ConstructionProject,
  ConstructionTimelineEvent,
} from "@/lib/api/construction";

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ProjectProgressBar({ value }: { value: string }) {
  const numeric = Math.min(Math.max(Number(value), 0), 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand-text">Overall progress</span>
        <span className="font-semibold text-brand-secondary">{numeric.toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-white/10">
        <div className="h-3 rounded-full bg-brand-secondary" style={{ width: `${numeric}%` }} />
      </div>
    </div>
  );
}

export function ConstructionProjectCard({
  project,
  href,
}: {
  project: ConstructionProject;
  href?: string;
}) {
  const content = (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <ConstructionStatusBadge status={project.status} />
          <h2 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
            {project.name}
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            {project.property.title} · {project.property.city ?? project.property.location}
          </p>
        </div>
        {href ? <span className={buttonClasses("secondary")}>Open</span> : null}
      </div>
      <div className="mt-5">
        <ProjectProgressBar value={project.overall_progress} />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-brand-muted sm:grid-cols-2">
        <span>Start: {formatDate(project.planned_start_date)}</span>
        <span>Target: {formatDate(project.planned_end_date)}</span>
      </div>
    </Card>
  );

  return href ? (
    <Link className="block" href={href}>
      {content}
    </Link>
  ) : (
    content
  );
}

export function MilestoneList({ milestones }: { milestones: ConstructionMilestone[] }) {
  if (milestones.length === 0) {
    return <EmptyDashboardState message="Milestones will appear after project setup." />;
  }
  return (
    <div className="space-y-3">
      {milestones
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((milestone) => (
          <div className="rounded-md border border-white/10 bg-white/5 p-4" key={milestone.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-text">
                  {milestone.sequence}. {milestone.name}
                </p>
                {milestone.description ? (
                  <p className="mt-1 text-sm text-brand-muted">{milestone.description}</p>
                ) : null}
              </div>
              <ConstructionStatusBadge status={milestone.status} />
            </div>
            <div className="mt-3">
              <ProjectProgressBar value={milestone.progress_percent} />
            </div>
            {milestone.requires_inspection ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                Inspection gate required
              </p>
            ) : null}
          </div>
        ))}
    </div>
  );
}

export function ConstructionActivity({ activity }: { activity: ConstructionTimelineEvent[] }) {
  return (
    <ActivityTimeline
      activity={activity.map((item) => ({
        id: item.id,
        title: item.description || item.event_type,
        description: item.actor_label,
        status: item.event_type,
        timestamp: item.created_at,
      }))}
    />
  );
}

export function ConstructionDashboardBody({
  dashboard,
  baseHref,
}: {
  dashboard: ConstructionDashboard;
  baseHref: string;
}) {
  return (
    <div className="mt-8 space-y-8">
      <DashboardStatGrid stats={dashboard.stats} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection title="Active projects">
          <div className="space-y-4">
            {dashboard.projects.map((project) => (
              <ConstructionProjectCard
                href={`${baseHref}/projects/${project.slug}`}
                key={project.id}
                project={project}
              />
            ))}
            {dashboard.projects.length === 0 ? (
              <EmptyDashboardState message="Construction projects will appear here once created." />
            ) : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Pending progress updates">
          <div className="space-y-3">
            {dashboard.pending_updates.map((update) => (
              <div className="rounded-md border border-white/10 bg-white/5 p-4" key={update.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-text">{update.title}</p>
                    <p className="mt-1 text-sm text-brand-muted">{update.summary}</p>
                  </div>
                  <ConstructionStatusBadge status={update.status} />
                </div>
              </div>
            ))}
            {dashboard.pending_updates.length === 0 ? (
              <EmptyDashboardState message="No progress update is waiting right now." />
            ) : null}
          </div>
        </DashboardSection>
      </div>
      <DashboardSection title="Recent project activity">
        <ConstructionActivity activity={dashboard.activity} />
      </DashboardSection>
    </div>
  );
}
