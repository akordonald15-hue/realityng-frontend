import { TradeCategoryCard } from "@/components/services/trade-category-card";
import type { TradeCategory } from "@/lib/api/services";

type TradeCategoryGridProps = {
  categories: TradeCategory[];
};

export function TradeCategoryGrid({ categories }: TradeCategoryGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {categories.map((category) => (
        <TradeCategoryCard category={category} key={category.slug} />
      ))}
    </div>
  );
}
