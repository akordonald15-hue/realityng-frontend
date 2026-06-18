import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-md border border-white/10 bg-brand-surface/90 shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
