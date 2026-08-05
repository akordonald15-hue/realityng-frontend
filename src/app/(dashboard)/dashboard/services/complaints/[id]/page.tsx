"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ComplaintDetail } from "@/components/services/governance-detail";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getMyServiceComplaint } from "@/lib/api/services";

export default function CustomerComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const complaintQuery = useQuery({
    queryKey: ["customer-service-complaint", params.id],
    queryFn: () => getMyServiceComplaint(params.id),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Complaint details"
        title="Service complaint timeline"
        description="Track the current state, evidence and operational decision on this complaint."
      />
      <div className="mt-8">
        {complaintQuery.isLoading ? <Card className="p-5 text-brand-muted">Loading...</Card> : null}
        {complaintQuery.data ? <ComplaintDetail complaint={complaintQuery.data} /> : null}
      </div>
    </main>
  );
}
