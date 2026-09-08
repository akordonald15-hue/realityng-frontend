import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "gold"
  | "green"
  | "muted"
  | "reality"
  | "approved"
  | "pending"
  | "rejected"
  | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeClasses: Record<BadgeVariant, string> = {
  gold: "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary",
  green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  muted: "border-white/10 bg-white/5 text-brand-muted",
  reality: "border-transparent bg-reality-alpha-white text-reality-alpha-black70",
  approved: "border-reality-brand-500/20 bg-reality-brand-50 text-reality-brand-700",
  pending: "border-amber-300/40 bg-amber-50 text-amber-700",
  rejected: "border-red-300/40 bg-red-50 text-red-700",
  info: "border-blue-300/40 bg-blue-50 text-blue-700",
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
