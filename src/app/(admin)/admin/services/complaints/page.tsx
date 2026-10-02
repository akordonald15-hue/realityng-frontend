"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ComplaintCard } from "@/components/services/governance-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  adminListComplaints,
  adminModerateComplaint,
  type ServiceComplaint,
} from "@/lib/api/services";

export default function AdminServiceComplaintsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const complaintsQuery = useQuery({
    queryKey: ["admin-service-complaints", page],
    queryFn: () => adminListComplaints({ page }),
  });
  const moderationMutation = useMutation({
    mutationFn: ({
      complaint,
      action,
    }: {
      complaint: ServiceComplaint;
      action: "review" | "resolve" | "reject" | "escalate" | "close";
    }) => adminModerateComplaint(complaint.id, action, `${action} by services operations`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-service-complaints"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services moderation"
          title="Complaints queue"
          description="Review, resolve, reject, escalate, or close services marketplace complaints."
        />

        <div className="mt-8 space-y-4">
          {complaintsQuery.isLoading ? (
            <Card className="p-5 text-reality-text-secondary">Loading complaints...</Card>
          ) : null}
          {complaintsQuery.data?.results.map((complaint) => (
            <div className="space-y-3" key={complaint.id}>
              <ComplaintCard
                complaint={complaint}
                href={`/admin/services/complaints/${complaint.id}`}
              />
              <div className="flex flex-wrap gap-2">
                {(["review", "resolve", "reject", "escalate", "close"] as const).map((action) => (
                  <Button
                    disabled={moderationMutation.isPending}
                    key={action}
                    onClick={() => {
                      if (window.confirm(`${action} this complaint? This decision is recorded in its operational history.`)) moderationMutation.mutate({ complaint, action });
                    }}
                    variant={action === "resolve" ? "primary" : "secondary"}
                  >
                    {action.replaceAll("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          {complaintsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-reality-text-secondary">No service complaints are open.</Card>
          ) : null}
        </div>
        {complaintsQuery.data ? <AdminPagination count={complaintsQuery.data.count} hasNext={Boolean(complaintsQuery.data.next)} hasPrevious={Boolean(complaintsQuery.data.previous)} onPageChange={setPage} page={page} /> : null}
      </main>
    </ProtectedRoute>
  );
}
