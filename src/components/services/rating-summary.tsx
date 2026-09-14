import { StarRating } from "@/components/services/star-rating";
import { Card } from "@/components/ui/card";
import type { ServiceProvider } from "@/lib/api/services";

export function RatingSummary({
  provider,
  variant = "reality",
}: {
  provider: ServiceProvider;
  variant?: "legacy" | "reality";
}) {
  const summary = provider.reviews_summary;
  const reviewCount = summary?.review_count ?? provider.published_review_count ?? 0;
  const average = Number(summary?.average_rating ?? provider.average_rating ?? 0);
  const recommendation = summary?.recommendation_percentage ?? provider.recommendation_percentage ?? 0;
  const isReality = variant === "reality";

  return (
    <Card className="p-5" variant={isReality ? "reality" : "legacy"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            className={
              isReality
                ? "text-xs font-bold uppercase tracking-[0.22em] text-reality-brand-600"
                : "text-xs font-bold uppercase tracking-[0.22em] text-reality-brand-600"
            }
          >
            Customer trust
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={
                isReality
                  ? "font-display text-4xl font-semibold text-reality-text-primary"
                  : "font-display text-4xl font-semibold text-reality-text-primary"
              }
            >
              {average ? average.toFixed(1) : "New"}
            </span>
            {average ? <StarRating readOnly value={average} /> : null}
          </div>
          <p className={isReality ? "mt-2 text-sm text-reality-text-secondary" : "mt-2 text-sm text-reality-text-secondary"}>
            {reviewCount} published verified booking review{reviewCount === 1 ? "" : "s"}
          </p>
        </div>
        <div
          className={
            isReality
              ? "rounded-[18px] border border-reality-border-secondary bg-reality-bg-subtle px-4 py-3 text-right"
              : "rounded-md border border-reality-border-secondary bg-reality-bg-subtle px-4 py-3 text-right"
          }
        >
          <p className={isReality ? "text-2xl font-bold text-reality-text-primary" : "text-2xl font-bold text-reality-text-primary"}>
            {recommendation}%
          </p>
          <p className={isReality ? "text-xs uppercase tracking-wide text-reality-text-secondary" : "text-xs uppercase tracking-wide text-reality-text-secondary"}>
            Recommend
          </p>
        </div>
      </div>
    </Card>
  );
}


