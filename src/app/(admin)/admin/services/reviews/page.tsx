"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ReviewModerationList } from "@/components/services/review-moderation-list";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { adminListServiceReviews, type ServiceReviewStatus } from "@/lib/api/services";

export default function AdminServiceReviewsPage() {
  const [status, setStatus] = useState<ServiceReviewStatus | "">("pending");
  const [page, setPage] = useState(1);
  const reviewsQuery = useQuery({
    queryKey: ["admin-service-reviews", status, page],
    queryFn: () => adminListServiceReviews({ status, ordering: "newest", page }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Service review moderation"
          description="Publish, hide, restore, dispute, or remove booking-linked provider reviews."
        />
        <Card className="mt-6 max-w-xs p-4">
          <Select
            aria-label="Filter reviews by status"
            onChange={(event) => { setStatus(event.target.value as ServiceReviewStatus | ""); setPage(1); }}
            value={status}
          >
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="flagged">Flagged</option>
            <option value="hidden">Hidden</option>
            <option value="disputed">Disputed</option>
            <option value="removed">Removed</option>
          </Select>
        </Card>
        <div className="mt-6">
          {reviewsQuery.isLoading ? (
            <Card className="p-5 text-reality-text-secondary">Loading reviews...</Card>
          ) : (
            <ReviewModerationList reviews={reviewsQuery.data?.results ?? []} />
          )}
        </div>
        {reviewsQuery.data ? <AdminPagination count={reviewsQuery.data.count} hasNext={Boolean(reviewsQuery.data.next)} hasPrevious={Boolean(reviewsQuery.data.previous)} onPageChange={setPage} page={page} /> : null}
      </main>
    </ProtectedRoute>
  );
}
