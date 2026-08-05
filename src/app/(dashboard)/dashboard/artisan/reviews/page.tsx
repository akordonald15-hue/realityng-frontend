"use client";

import { useQuery } from "@tanstack/react-query";

import { ReviewCard } from "@/components/services/review-card";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { listProviderServiceReviews, type ServiceReviewStatus } from "@/lib/api/services";
import { useState } from "react";

export default function ProviderReviewsPage() {
  const [status, setStatus] = useState<ServiceReviewStatus | "">("");
  const reviewsQuery = useQuery({
    queryKey: ["provider-service-reviews", status],
    queryFn: () => listProviderServiceReviews({ status, ordering: "newest" }),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Provider dashboard"
        title="Reviews and trust"
        description="Read booking-linked customer reviews, respond once to published reviews, and flag content for admin moderation."
      />
      <Card className="mt-6 max-w-xs p-4">
        <Select onChange={(event) => setStatus(event.target.value as ServiceReviewStatus | "")}>
          <option value="">Any status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="flagged">Flagged</option>
          <option value="hidden">Hidden</option>
          <option value="disputed">Disputed</option>
          <option value="removed">Removed</option>
        </Select>
      </Card>
      <div className="mt-6 grid gap-4">
        {reviewsQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading provider reviews...</Card>
        ) : reviewsQuery.data?.results.length ? (
          reviewsQuery.data.results.map((review) => (
            <ReviewCard key={review.id} mode="provider" review={review} />
          ))
        ) : (
          <Card className="p-5 text-sm text-brand-muted">
            Reviews from completed service engagements will appear here.
          </Card>
        )}
      </div>
    </main>
  );
}
