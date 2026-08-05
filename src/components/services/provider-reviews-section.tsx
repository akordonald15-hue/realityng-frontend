"use client";

import { useQuery } from "@tanstack/react-query";

import { RatingSummary } from "@/components/services/rating-summary";
import { ReviewCard } from "@/components/services/review-card";
import { Card } from "@/components/ui/card";
import { listServiceReviews, type ServiceProvider } from "@/lib/api/services";

export function ProviderReviewsSection({ provider }: { provider: ServiceProvider }) {
  const reviewsQuery = useQuery({
    queryKey: ["service-provider-reviews", provider.slug],
    queryFn: () => listServiceReviews(provider.slug, { ordering: "newest" }),
  });

  return (
    <div className="space-y-4">
      <RatingSummary provider={provider} />
      {reviewsQuery.isLoading ? (
        <Card className="p-5 text-brand-muted">Loading verified reviews...</Card>
      ) : reviewsQuery.data?.results.length ? (
        <div className="grid gap-4">
          {reviewsQuery.data.results.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <Card className="p-5 text-sm text-brand-muted">
          No published booking-linked reviews are available yet.
        </Card>
      )}
    </div>
  );
}
