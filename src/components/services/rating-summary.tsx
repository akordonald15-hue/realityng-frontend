import { StarRating } from "@/components/services/star-rating";
import { Card } from "@/components/ui/card";
import type { ServiceProvider } from "@/lib/api/services";

export function RatingSummary({ provider }: { provider: ServiceProvider }) {
  const summary = provider.reviews_summary;
  const reviewCount = summary?.review_count ?? provider.published_review_count ?? 0;
  const average = Number(summary?.average_rating ?? provider.average_rating ?? 0);
  const recommendation = summary?.recommendation_percentage ?? provider.recommendation_percentage ?? 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-secondary">
            Customer trust
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-heading text-4xl font-semibold text-brand-text">
              {average ? average.toFixed(1) : "New"}
            </span>
            {average ? <StarRating readOnly value={average} /> : null}
          </div>
          <p className="mt-2 text-sm text-brand-muted">
            {reviewCount} published verified booking review{reviewCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-right">
          <p className="text-2xl font-bold text-brand-text">{recommendation}%</p>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Recommend</p>
        </div>
      </div>
    </Card>
  );
}
