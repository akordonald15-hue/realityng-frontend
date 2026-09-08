import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

type SelectVariant = "legacy" | "reality";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant;
};

const selectClasses: Record<SelectVariant, string> = {
  legacy:
    "h-11 rounded-md border-white/10 bg-brand-surface text-brand-text focus:border-brand-secondary focus:ring-brand-secondary/20",
  reality:
    "h-14 rounded-[12px] border-reality-border-secondary bg-white text-reality-text-primary shadow-reality-sm focus:border-reality-brand-500 focus:ring-reality-brand-500/15",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, variant = "legacy", ...props },
  ref,
) {
  return (
    <select
      className={clsx(
        "w-full border px-3 text-sm outline-none transition focus:ring-2",
        selectClasses[variant],
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
