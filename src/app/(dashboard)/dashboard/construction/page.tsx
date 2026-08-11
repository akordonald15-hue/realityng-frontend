"use client";

import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ConstructionDashboardBody } from "@/components/construction/construction-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getOwnerConstructionDashboard } from "@/lib/api/construction";

export default function OwnerConstructionDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["owner-construction-dashboard"],
    queryFn: getOwnerConstructionDashboard,
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Construction tracking"
          title="Remote project oversight"
          description="Follow milestone progress, evidence, inspection gates, and recent changes for properties where you have construction visibility."
        />
        {dashboardQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading construction projects...</Card>
        ) : null}
        {dashboardQuery.isError ? (
          <Card className="mt-8 p-5 text-red-200">Construction dashboard could not load.</Card>
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
