"use client";

import { clsx } from "clsx";

export function StarRating({
  label,
  name,
  onChange,
  readOnly = false,
  value,
}: {
  label?: string;
  name?: string;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  value: number;
}) {
  if (readOnly) {
    return (
      <span aria-label={`${value} out of 5 stars`} className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            aria-hidden="true"
            className={star <= Math.round(value) ? "text-reality-brand-600" : "text-reality-text-secondary/40"}
            key={star}
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <fieldset className="grid gap-2">
      {label ? <legend className="text-sm font-semibold text-reality-text-primary">{label}</legend> : null}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            aria-pressed={star === value}
            className={clsx(
              "h-10 w-10 rounded-md border border-reality-border-secondary text-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500",
              star <= value
                ? "bg-brand-secondary/15 text-reality-brand-600"
                : "bg-reality-bg-subtle text-reality-text-secondary",
            )}
            key={star}
            name={name}
            onClick={() => onChange?.(star)}
            type="button"
            value={star}
          >
            <span aria-hidden="true">★</span>
            <span className="sr-only">{star} stars</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

