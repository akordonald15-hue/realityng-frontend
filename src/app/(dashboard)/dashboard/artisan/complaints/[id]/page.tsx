"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ComplaintDetail } from "@/components/services/governance-detail";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getProviderComplaint } from "@/lib/api/services";

export default function ProviderComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const complaintQuery = useQuery({
    queryKey: ["provider-service-complaint", params.id],
    queryFn: () => getProviderComplaint(params.id),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider complaint"
        title="Complaint timeline"
        description="Review the complaint status and current RealityNG moderation outcome."
      />
      <div className="mt-8">
        {complaintQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading...</Card>
        ) : null}
        {complaintQuery.data ? <ComplaintDetail complaint={complaintQuery.data} /> : null}
      </div>
    </main>
  );
}
