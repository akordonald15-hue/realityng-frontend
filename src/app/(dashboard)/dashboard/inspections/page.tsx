"use client";

import { useQuery } from "@tanstack/react-query";

import { InspectionRequestCard } from "@/components/inspections/inspection-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCustomerInspectionDashboard } from "@/lib/api/inspections";

export default function CustomerInspectionsPage() {
  const dashboardQuery = useQuery({
    queryKey: ["customer-inspection-dashboard"],
    queryFn: getCustomerInspectionDashboard,
  });
  const dashboard = dashboardQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Inspections"
        title="My property inspection requests"
        description="Track evidence requests, status changes, scheduled work, private reports, and completed inspection outcomes."
      />

      {dashboardQuery.isLoading ? (
        <Card className="mt-8 p-5 text-brand-muted">Loading inspection requests...</Card>
      ) : null}
      {dashboardQuery.isError ? (
        <Card className="mt-8 p-5 text-red-200">Inspection dashboard could not be loaded.</Card>
      ) : null}
      <div className="mt-8 grid gap-4">
        {dashboard?.recent_requests.map((request) => (
          <InspectionRequestCard
            href={`/dashboard/inspections/${request.id}`}
            key={request.id}
            request={request}
          />
        ))}
        {dashboard?.recent_requests.length === 0 ? (
          <Card className="p-5 text-sm text-brand-muted">
            Inspection requests you create from property pages will appear here.
          </Card>
        ) : null}
      </div>
    </main>
  );
}
