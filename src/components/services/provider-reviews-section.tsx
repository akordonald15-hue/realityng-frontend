"use client";

import { useQuery } from "@tanstack/react-query";

import { RatingSummary } from "@/components/services/rating-summary";
import { ReviewCard } from "@/components/services/review-card";
import { Card } from "@/components/ui/card";
import { listServiceReviews, type ServiceProvider } from "@/lib/api/services";

export function ProviderReviewsSection({
  provider,
  variant = "reality",
}: {
  provider: ServiceProvider;
  variant?: "legacy" | "reality";
}) {
  const reviewsQuery = useQuery({
    queryKey: ["service-provider-reviews", provider.slug],
    queryFn: () => listServiceReviews(provider.slug, { ordering: "newest" }),
  });

  const isReality = variant === "reality";

  return (
    <div className="space-y-4">
      <RatingSummary provider={provider} variant={variant} />
      {reviewsQuery.isLoading ? (
        <Card
          className={isReality ? "p-5 text-reality-text-secondary" : "p-5 text-reality-text-secondary"}
          variant={isReality ? "reality" : "legacy"}
        >
          Loading verified reviews...
        </Card>
      ) : reviewsQuery.data?.results.length ? (
        <div className="grid gap-4">
          {reviewsQuery.data.results.map((review) => (
            <ReviewCard key={review.id} review={review} variant={variant} />
          ))}
        </div>
      ) : (
        <Card
          className={isReality ? "p-5 text-sm text-reality-text-secondary" : "p-5 text-sm text-reality-text-secondary"}
          variant={isReality ? "reality" : "legacy"}
        >
          No published booking-linked reviews are available yet.
        </Card>
      )}
    </div>
  );
}


