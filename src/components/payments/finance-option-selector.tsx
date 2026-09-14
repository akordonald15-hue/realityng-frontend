"use client";

import Link from "next/link";
import { clsx } from "clsx";

import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type { FinancingProduct } from "@/lib/api/financing";

function formatMoney(value: string, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return new Intl.NumberFormat("en-NG", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function productTypeLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function FinanceOptionCard({
  isSelected,
  onSelect,
  product,
}: {
  isSelected: boolean;
  onSelect: () => void;
  product: FinancingProduct;
}) {
  const maxAmount = formatMoney(product.maximum_amount, product.currency);
  const minAmount = formatMoney(product.minimum_amount, product.currency);
  const applyHref = `/dashboard/financing/apply?product_id=${encodeURIComponent(product.id)}`;
  const isActive = product.status === "active";

  return (
    <Card
      className={clsx(
        "reality-card-hover flex min-h-[210px] flex-col rounded-[10px] border bg-white p-4 shadow-none",
        isSelected
          ? "border-reality-brand-500 ring-2 ring-reality-brand-500/20"
          : "border-reality-border-primary",
        !isActive && "opacity-70",
      )}
      variant="reality"
    >
      <button
        aria-pressed={isSelected}
        className="group flex flex-1 flex-col items-start text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
        disabled={!isActive}
        onClick={onSelect}
        type="button"
      >
        <span className="mb-4 h-10 w-10 rounded-full bg-reality-bg-muted" aria-hidden="true" />
        <span className="text-xs font-medium capitalize leading-5 text-reality-brand-600">
          {product.partner.name}
        </span>
        <span className="mt-2 text-base font-bold leading-6 text-reality-text-primary">
          {maxAmount ? `Up to ${maxAmount}` : product.name}
        </span>
        <span className="mt-2 text-sm leading-5 text-reality-text-secondary">
          {product.minimum_tenor_months}-{product.maximum_tenor_months} months
        </span>
        {minAmount ? (
          <span className="mt-1 text-sm leading-5 text-reality-text-secondary">
            From {minAmount}
          </span>
        ) : null}
        <span className="mt-2 text-xs capitalize leading-5 text-reality-text-quaternary">
          {productTypeLabel(product.product_type)}
        </span>
      </button>

      {isActive ? (
        <Link className={buttonClasses("reality", "mt-3 h-9 w-full")} href={applyHref}>
          Apply
        </Link>
      ) : (
        <Button className="mt-3 h-9 w-full" disabled variant="realitySecondary">
          Unavailable
        </Button>
      )}
    </Card>
  );
}

export function FinanceOptionSelector({
  error,
  isLoading,
  onCloseHref = "/dashboard",
  onSelect,
  products,
  selectedProductId,
}: {
  error?: string;
  isLoading?: boolean;
  onCloseHref?: string;
  onSelect: (product: FinancingProduct) => void;
  products: FinancingProduct[];
  selectedProductId?: string;
}) {
  const activeProducts = products.filter((product) => product.status === "active");

  return (
    <section
      aria-labelledby="property-financing-title"
      className="reality-reveal mx-auto w-full max-w-[620px] rounded-[32px] bg-white px-6 py-6 shadow-reality-sm sm:px-12 sm:py-12"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-reality-sm">
            <span className="font-display text-2xl font-semibold text-[#bc8936]">R</span>
          </div>
          <h1
            className="text-[28px] font-bold leading-8 text-reality-text-primary"
            id="property-financing-title"
          >
            Property financing
          </h1>
          <p className="mt-4 max-w-[454px] text-sm leading-5 text-reality-text-secondary">
            Apply for financing from one of our lending partners and repay over time.
          </p>
        </div>
        <Link
          aria-label="Close property financing"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reality-bg-muted text-xl leading-none text-reality-text-tertiary transition hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
          href={onCloseHref}
        >
          x
        </Link>
      </div>

      {isLoading ? (
        <Card
          className="mt-6 rounded-[10px] p-4 text-sm text-reality-text-quaternary"
          variant="reality"
        >
          Loading financing options...
        </Card>
      ) : error ? (
        <Card className="mt-6 rounded-[10px] p-4" variant="reality">
          <StatusChip tone="rejected">Unavailable</StatusChip>
          <p className="mt-3 text-sm leading-6 text-reality-text-secondary">{error}</p>
        </Card>
      ) : activeProducts.length ? (
        <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-3">
          {activeProducts.map((product) => (
            <FinanceOptionCard
              isSelected={selectedProductId === product.id}
              key={product.id}
              onSelect={() => onSelect(product)}
              product={product}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-6 rounded-[10px] p-4" variant="reality">
          <StatusChip tone="neutral">No options</StatusChip>
          <p className="mt-3 text-sm leading-6 text-reality-text-secondary">
            Financing options are not available for this account right now.
          </p>
        </Card>
      )}

      <p className="mt-7 max-w-[398px] text-base leading-6 text-reality-text-secondary">
        Financing is provided by third-party lending partners and is subject to eligibility and
        approval.
      </p>
    </section>
  );
}

