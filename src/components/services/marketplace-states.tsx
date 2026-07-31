import { Card } from "@/components/ui/card";

type EmptyMarketplaceStateProps = {
  title?: string;
  description?: string;
};

export function EmptyMarketplaceState({
  title = "No service providers found",
  description = "Try another trade, city, or LGA. Only approved public providers appear here.",
}: EmptyMarketplaceStateProps) {
  return (
    <Card className="p-8 text-center">
      <h3 className="font-heading text-2xl font-semibold text-brand-text">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-brand-muted">{description}</p>
    </Card>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading providers">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="h-72 animate-pulse rounded-md bg-white/10" key={item} />
      ))}
    </div>
  );
}

export function LoadingPlaceholder({ label = "Loading marketplace" }: { label?: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-6 text-sm text-brand-muted">
      {label}
    </div>
  );
}
