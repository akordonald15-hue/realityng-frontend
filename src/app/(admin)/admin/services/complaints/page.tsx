"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
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
  const complaintsQuery = useQuery({
    queryKey: ["admin-service-complaints"],
    queryFn: () => adminListComplaints(),
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
            <Card className="p-5 text-brand-muted">Loading complaints...</Card>
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
                    onClick={() => moderationMutation.mutate({ complaint, action })}
                    variant={action === "resolve" ? "primary" : "secondary"}
                  >
                    {action.replaceAll("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          {complaintsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No service complaints are open.</Card>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
