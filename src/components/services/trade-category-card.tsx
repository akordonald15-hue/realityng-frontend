import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { TradeCategory } from "@/lib/api/services";

type TradeCategoryCardProps = {
  category: TradeCategory;
};

export function TradeCategoryCard({ category }: TradeCategoryCardProps) {
  return (
    <Link href={`/services?category=${category.slug}`}>
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-brand-secondary/50">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-secondary">
          {category.children.length} trades
        </p>
        <h3 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
          {category.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-brand-muted">{category.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {category.children.slice(0, 4).map((child) => (
            <span
              className="rounded-sm border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-brand-muted"
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
