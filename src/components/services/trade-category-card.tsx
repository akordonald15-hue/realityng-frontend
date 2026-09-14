import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { TradeCategory } from "@/lib/api/services";

type TradeCategoryCardProps = {
  category: TradeCategory;
};

export function TradeCategoryCard({ category }: TradeCategoryCardProps) {
  return (
    <Link
      className="block h-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
      href={`/services?category=${category.slug}`}
    >
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-reality-brand-500/30" variant="reality">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-reality-brand-600">
          {category.children.length} trades
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-reality-text-primary">
          {category.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{category.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {category.children.slice(0, 4).map((child) => (
            <span
              className="rounded-full border border-reality-border-secondary bg-reality-bg-subtle px-2.5 py-1 text-xs font-semibold text-reality-text-secondary"
              key={child.slug}
            >
              {child.name}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
}

