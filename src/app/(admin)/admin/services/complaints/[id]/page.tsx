"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ComplaintDetail } from "@/components/services/governance-detail";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { adminGetComplaint } from "@/lib/api/services";

export default function AdminComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const complaintQuery = useQuery({
    queryKey: ["admin-service-complaint", params.id],
    queryFn: () => adminGetComplaint(params.id),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services moderation"
          title="Complaint review"
          description="Inspect evidence and moderation state before taking an operational action."
        />
        <div className="mt-8">
          {complaintQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading...</Card>
          ) : null}
          {complaintQuery.data ? <ComplaintDetail complaint={complaintQuery.data} /> : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
