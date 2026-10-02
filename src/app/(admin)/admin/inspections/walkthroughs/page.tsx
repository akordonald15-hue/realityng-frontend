"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { WalkthroughModerationCard } from "@/components/inspections/inspection-widgets";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import {
  adminApproveWalkthrough,
  adminListWalkthroughs,
  adminRejectWalkthrough,
  type WalkthroughStatus,
} from "@/lib/api/inspections";

export default function AdminWalkthroughsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<WalkthroughStatus | "">("pending_review");
  const [page, setPage] = useState(1);
  const walkthroughsQuery = useQuery({
    queryKey: ["admin-walkthroughs", status, page],
    queryFn: () => adminListWalkthroughs(status || undefined, page),
  });
  const approveMutation = useMutation({
    mutationFn: adminApproveWalkthrough,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-walkthroughs"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRejectWalkthrough(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-walkthroughs"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Walkthrough moderation"
          description="Only approved videos become public on property pages. Rejected or hidden videos remain private."
        />
        <Card className="mt-6 p-4">
          <Select aria-label="Filter walkthroughs by status" onChange={(event) => { setStatus(event.target.value as WalkthroughStatus | ""); setPage(1); }} value={status}>
            <option value="">Any status</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="hidden">Hidden</option>
          </Select>
        </Card>
        <div className="mt-6 grid gap-4">
          {walkthroughsQuery.isLoading ? (
            <Card className="p-5 text-reality-text-secondary">Loading walkthroughs...</Card>
          ) : null}
          {walkthroughsQuery.data?.results.map((walkthrough) => (
            <WalkthroughModerationCard
              key={walkthrough.id}
              onApprove={
                walkthrough.status === "pending_review"
                  ? () => approveMutation.mutate(walkthrough.id)
                  : undefined
              }
              onReject={(reason) => rejectMutation.mutate({ id: walkthrough.id, reason })}
              pending={approveMutation.isPending || rejectMutation.isPending}
              walkthrough={walkthrough}
            />
          ))}
          {walkthroughsQuery.data?.results.length === 0 ? (
            <Card className="p-5 text-sm text-reality-text-secondary">No walkthroughs match this queue.</Card>
          ) : null}
          {walkthroughsQuery.isError ? <Card className="border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">Walkthroughs could not be loaded.</Card> : null}
        </div>
        {walkthroughsQuery.data ? <AdminPagination count={walkthroughsQuery.data.count} hasNext={Boolean(walkthroughsQuery.data.next)} hasPrevious={Boolean(walkthroughsQuery.data.previous)} onPageChange={setPage} page={page} /> : null}
      </main>
    </ProtectedRoute>
  );
}
