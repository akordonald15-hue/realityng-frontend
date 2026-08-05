"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppealDetail } from "@/components/services/governance-detail";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { adminGetAppeal } from "@/lib/api/services";

export default function AdminAppealDetailPage() {
  const params = useParams<{ id: string }>();
  const appealQuery = useQuery({
    queryKey: ["admin-service-appeal", params.id],
    queryFn: () => adminGetAppeal(params.id),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services moderation"
          title="Appeal review"
          description="Inspect the provider appeal and decision history before moderation."
        />
        <div className="mt-8">
          {appealQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading...</Card>
          ) : null}
          {appealQuery.data ? <AppealDetail appeal={appealQuery.data} /> : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
