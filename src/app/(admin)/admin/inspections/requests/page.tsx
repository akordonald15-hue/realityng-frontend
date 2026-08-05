"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { InspectionRequestCard } from "@/components/inspections/inspection-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import {
  adminApproveInspectionRequest,
  adminListInspectionRequests,
  adminRejectInspectionRequest,
  type InspectionRequestStatus,
} from "@/lib/api/inspections";

export default function AdminInspectionRequestsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<InspectionRequestStatus | "">("requested");
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const requestsQuery = useQuery({
    queryKey: ["admin-inspection-requests", status],
    queryFn: () => adminListInspectionRequests(status || undefined),
  });
  const approveMutation = useMutation({
    mutationFn: adminApproveInspectionRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspection-requests"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRejectInspectionRequest(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inspection-requests"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Inspection request queue"
          description="Moderate customer inspection requests before assignment, scheduling, and evidence collection."
        />
        <Card className="mt-6 p-4">
          <Select
            onChange={(event) => setStatus(event.target.value as InspectionRequestStatus | "")}
            value={status}
          >
            <option value="">Any status</option>
            <option value="requested">Requested</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Card>
        <div className="mt-6 grid gap-4">
          {requestsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading inspection requests...</Card>
          ) : null}
          {requestsQuery.data?.results.map((request) => (
            <div className="space-y-3" key={request.id}>
              <InspectionRequestCard request={request} />
              {["requested", "under_review"].includes(request.status) ? (
                <Card className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto]">
                  <Button
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(request.id)}
                  >
                    Approve
                  </Button>
                  <input
                    className="h-11 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text"
                    onChange={(event) =>
                      setReasonById((current) => ({ ...current, [request.id]: event.target.value }))
                    }
                    placeholder="Rejection reason"
                    value={reasonById[request.id] ?? ""}
                  />
                  <Button
                    disabled={rejectMutation.isPending || !reasonById[request.id]?.trim()}
                    onClick={() =>
                      rejectMutation.mutate({
                        id: request.id,
                        reason: reasonById[request.id],
                      })
                    }
                    variant="secondary"
                  >
                    Reject
                  </Button>
                </Card>
              ) : null}
            </div>
          ))}
          {requestsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No inspection requests match this queue.</Card>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
