"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPagination } from "@/components/admin/admin-pagination";
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
  const [page, setPage] = useState(1);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const requestsQuery = useQuery({
    queryKey: ["admin-inspection-requests", status, page],
    queryFn: () => adminListInspectionRequests(status || undefined, page),
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
            aria-label="Filter inspection requests by status"
            onChange={(event) => { setStatus(event.target.value as InspectionRequestStatus | ""); setPage(1); }}
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
            <Card className="p-5 text-reality-text-secondary">Loading inspection requests...</Card>
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
                    className="h-11 rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-3 text-sm text-reality-text-primary"
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
            <Card className="p-5 text-sm text-reality-text-secondary">No inspection requests match this queue.</Card>
          ) : null}
          {requestsQuery.isError ? (
            <Card className="border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">Inspection requests could not be loaded.</Card>
          ) : null}
        </div>
        {requestsQuery.data ? <AdminPagination count={requestsQuery.data.count} hasNext={Boolean(requestsQuery.data.next)} hasPrevious={Boolean(requestsQuery.data.previous)} onPageChange={setPage} page={page} /> : null}
      </main>
    </ProtectedRoute>
  );
}
