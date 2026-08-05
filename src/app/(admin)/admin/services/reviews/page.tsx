"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReviewModerationList } from "@/components/services/review-moderation-list";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { adminListServiceReviews, type ServiceReviewStatus } from "@/lib/api/services";

export default function AdminServiceReviewsPage() {
  const [status, setStatus] = useState<ServiceReviewStatus | "">("pending");
  const reviewsQuery = useQuery({
    queryKey: ["admin-service-reviews", status],
    queryFn: () => adminListServiceReviews({ status, ordering: "newest" }),
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
            onChange={(event) => setStatus(event.target.value as ServiceReviewStatus | "")}
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
            <Card className="p-5 text-brand-muted">Loading reviews...</Card>
          ) : (
            <ReviewModerationList reviews={reviewsQuery.data?.results ?? []} />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
