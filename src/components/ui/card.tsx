import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type CardVariant = "legacy" | "reality" | "realityElevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const cardClasses: Record<CardVariant, string> = {
  legacy: "rounded-md border-reality-border-secondary bg-white/90 shadow-reality-sm",
  reality: "rounded-[32px] border-reality-border-secondary bg-white shadow-none",
  realityElevated: "rounded-[32px] border-reality-border-secondary bg-white shadow-reality-sm",
};

export function Card({ className, variant = "reality", ...props }: CardProps) {
  return (
    <div className={clsx("border transition-colors", cardClasses[variant], className)} {...props} />
  );
}

