"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AssignmentCard, InspectionRequestCard } from "@/components/inspections/inspection-widgets";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getInspectorInspectionDashboard } from "@/lib/api/inspections";

export default function InspectorDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["inspector-inspection-dashboard"],
    queryFn: getInspectorInspectionDashboard,
    retry: false,
  });
  const dashboard = dashboardQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Inspector dashboard"
          title="Inspection assignments and reports"
          description="Manage assigned inspection work, field evidence, reports, and private evidence submission."
        />
        <Link className={buttonClasses("secondary")} href="/dashboard/inspector/assignments">
          Assignments
        </Link>
      </div>

      {dashboardQuery.isLoading ? (
        <Card className="mt-8 p-5 text-brand-muted">Loading inspector dashboard...</Card>
      ) : null}
      {dashboardQuery.isError ? (
        <Card className="mt-8 p-5 text-red-200">
          Inspector dashboard is available only to approved inspectors.
        </Card>
      ) : null}
      {dashboard ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              Pending assignments
            </h2>
            <div className="mt-5 space-y-4">
              {(dashboard.pending_assignments ?? []).map((assignment) => (
                <AssignmentCard assignment={assignment} key={assignment.id} />
              ))}
              {(dashboard.pending_assignments ?? []).length === 0 ? (
                <p className="text-sm text-brand-muted">No active assignments.</p>
              ) : null}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-heading text-2xl font-semibold text-brand-text">
              Recent inspection work
            </h2>
            <div className="mt-5 space-y-4">
              {dashboard.recent_requests.map((request) => (
                <InspectionRequestCard
                  href={`/dashboard/inspector/assignments/${request.id}`}
                  key={request.id}
                  request={request}
                />
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
