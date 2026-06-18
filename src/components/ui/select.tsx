import { clsx } from "clsx";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      className={clsx(
        "h-11 w-full rounded-md border border-white/10 bg-brand-surface px-3 text-sm text-brand-text outline-none transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
