"use client";

import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ConstructionDashboardBody } from "@/components/construction/construction-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getAdminConstructionDashboard } from "@/lib/api/construction";

export default function AdminConstructionDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-construction-dashboard"],
    queryFn: getAdminConstructionDashboard,
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Construction oversight"
          description="Monitor construction projects, delayed timelines, pending updates, stakeholder access, and inspection-linked milestones."
        />
        {dashboardQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading construction oversight...</Card>
        ) : null}
        {dashboardQuery.isError ? (
          <Card className="mt-8 p-5 text-red-200">Construction oversight could not load.</Card>
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
