"use client";

import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ConstructionDashboardBody } from "@/components/construction/construction-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getOperationsConstructionDashboard } from "@/lib/api/construction";

export default function ConstructionOperationsDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["operations-construction-dashboard"],
    queryFn: getOperationsConstructionDashboard,
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Project operations"
          title="Construction project manager workspace"
          description="Track operational projects, submitted updates, inspection gates, and pending evidence for managed construction work."
        />
        {dashboardQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading project operations...</Card>
        ) : null}
        {dashboardQuery.isError ? (
          <Card className="mt-8 p-5 text-red-200">Project operations could not load.</Card>
        ) : null}
        {dashboardQuery.data ? (
          <ConstructionDashboardBody
            baseHref="/dashboard/construction"
            dashboard={dashboardQuery.data}
          />
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
