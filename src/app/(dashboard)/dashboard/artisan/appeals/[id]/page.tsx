"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { AppealDetail } from "@/components/services/governance-detail";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getProviderAppeal } from "@/lib/api/services";

export default function ProviderAppealDetailPage() {
  const params = useParams<{ id: string }>();
  const appealQuery = useQuery({
    queryKey: ["provider-appeal", params.id],
    queryFn: () => getProviderAppeal(params.id),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider appeal"
        title="Appeal decision timeline"
        description="Track the current appeal status and any RealityNG operations decision."
      />
      <div className="mt-8">
        {appealQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading...</Card>
        ) : null}
        {appealQuery.data ? <AppealDetail appeal={appealQuery.data} /> : null}
      </div>
    </main>
  );
}
