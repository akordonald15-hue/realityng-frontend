"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ConstructionStatusBadge } from "@/components/construction/construction-status-badge";
import {
  ConstructionActivity,
  MilestoneList,
  ProjectProgressBar,
} from "@/components/construction/construction-widgets";
import { DashboardSection } from "@/components/services/services-dashboard-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getConstructionProject, listConstructionTimeline } from "@/lib/api/construction";

export default function ConstructionProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const projectQuery = useQuery({
    queryKey: ["construction-project", params.slug],
    queryFn: () => getConstructionProject(params.slug),
  });
  const timelineQuery = useQuery({
    queryKey: ["construction-project-timeline", params.slug],
    queryFn: () => listConstructionTimeline(params.slug),
  });
  const project = projectQuery.data;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {projectQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading construction project...</Card>
        ) : null}
        {projectQuery.isError ? (
          <Card className="p-5 text-red-200">Construction project could not load.</Card>
        ) : null}
        {project ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SectionHeader
                eyebrow="Project detail"
                title={project.name}
                description={project.description || project.property.title}
              />
              <ConstructionStatusBadge status={project.status} />
            </div>
            <Card className="p-6">
              <ProjectProgressBar value={project.overall_progress} />
              <div className="mt-5 grid gap-4 text-sm text-brand-muted sm:grid-cols-2 lg:grid-cols-4">
                <span>Property: {project.property.title}</span>
                <span>Type: {project.project_type.replaceAll("_", " ")}</span>
                <span>Start: {project.planned_start_date ?? "Not set"}</span>
                <span>Target: {project.planned_end_date ?? "Not set"}</span>
              </div>
            </Card>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <DashboardSection title="Milestones">
                <MilestoneList milestones={project.milestones ?? []} />
              </DashboardSection>
              <DashboardSection title="Stakeholders">
                <div className="space-y-3">
                  {(project.stakeholders ?? []).map((stakeholder) => (
                    <div
                      className="rounded-md border border-white/10 bg-white/5 p-4"
                      key={stakeholder.id}
                    >
                      <p className="font-semibold text-brand-text">{stakeholder.user_email}</p>
                      <p className="mt-1 text-sm text-brand-muted">
                        {stakeholder.stakeholder_role.replaceAll("_", " ")} ·{" "}
                        {stakeholder.access_level.replaceAll("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              </DashboardSection>
            </div>
            <DashboardSection title="Timeline">
              <ConstructionActivity activity={timelineQuery.data ?? []} />
            </DashboardSection>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
