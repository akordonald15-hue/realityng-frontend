"use client";

import { useQuery } from "@tanstack/react-query";

import { ComplaintCard } from "@/components/services/governance-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listProviderComplaints } from "@/lib/api/services";

export default function ProviderComplaintsPage() {
  const complaintsQuery = useQuery({
    queryKey: ["provider-service-complaints"],
    queryFn: () => listProviderComplaints(),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider governance"
        title="Complaints and moderation requests"
        description="Track complaints involving your provider profile and respond through approved RealityNG support channels."
      />

      <div className="mt-8 space-y-4">
        {complaintsQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading provider complaints...</Card>
        ) : null}
        {complaintsQuery.isError ? (
          <Card className="p-5 text-red-200">Provider complaints could not be loaded.</Card>
        ) : null}
        {complaintsQuery.data?.results.map((complaint) => (
          <ComplaintCard complaint={complaint} key={complaint.id} />
        ))}
        {complaintsQuery.data?.results.length === 0 ? (
          <Card className="p-5 text-sm text-brand-muted">
            No complaints are currently linked to your provider profile.
          </Card>
        ) : null}
      </div>
    </main>
  );
}
