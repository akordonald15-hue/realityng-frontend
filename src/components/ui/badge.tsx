import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type BadgeVariant = "gold" | "green" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeClasses: Record<BadgeVariant, string> = {
  gold: "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary",
  green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  muted: "border-white/10 bg-white/5 text-brand-muted",
};

export function Badge({ className, variant = "gold", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        badgeClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
