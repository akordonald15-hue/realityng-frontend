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
    <Card className="p-8 text-center" variant="reality">
      <h3 className="font-display text-2xl font-semibold text-reality-text-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-reality-text-secondary">
        {description}
      </p>
    </Card>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading providers">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="h-72 animate-pulse rounded-[28px] bg-reality-bg-muted" key={item} />
      ))}
    </div>
  );
}

export function LoadingPlaceholder({ label = "Loading marketplace" }: { label?: string }) {
  return (
    <div className="rounded-[24px] border border-reality-border-secondary bg-white p-6 text-sm text-reality-text-secondary shadow-reality-sm">
      {label}
    </div>
  );
}

