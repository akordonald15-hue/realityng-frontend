import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type StatusTone = "approved" | "pending" | "rejected" | "info" | "neutral";

type StatusChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  approved: "border-reality-brand-500/20 bg-reality-brand-50 text-reality-brand-700",
  pending: "border-amber-300/40 bg-amber-50 text-amber-700",
  rejected: "border-red-300/40 bg-red-50 text-red-700",
  info: "border-blue-300/40 bg-blue-50 text-blue-700",
  neutral: "border-reality-border-secondary bg-reality-bg-subtle text-reality-text-secondary",
};

export function StatusChip({ className, tone = "neutral", ...props }: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize leading-5",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

