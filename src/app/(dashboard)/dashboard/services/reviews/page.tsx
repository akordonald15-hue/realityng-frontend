"use client";

import { useQuery } from "@tanstack/react-query";

import { ReviewCard } from "@/components/services/review-card";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listMyServiceReviews } from "@/lib/api/services";

export default function CustomerServiceReviewsPage() {
  const reviewsQuery = useQuery({
    queryKey: ["my-service-reviews"],
    queryFn: () => listMyServiceReviews({ ordering: "newest" }),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="My services"
        title="My provider reviews"
        description="Track reviews submitted from completed service engagements and see moderation status."
      />
      <div className="mt-6 grid gap-4">
        {reviewsQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading reviews...</Card>
        ) : reviewsQuery.data?.results.length ? (
          reviewsQuery.data.results.map((review) => (
            <ReviewCard key={review.id} mode="customer" review={review} />
          ))
        ) : (
          <Card className="p-5 text-sm text-brand-muted">
            Completed service reviews will appear here after submission.
          </Card>
        )}
      </div>
    </main>
  );
}
