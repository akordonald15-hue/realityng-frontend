import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  loading?: boolean;
};

export function MetricCard({
  className,
  detail,
  icon,
  label,
  loading = false,
  value,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[20px] border border-reality-border-secondary bg-reality-surface p-5 text-reality-text-primary shadow-reality-xs sm:p-6",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-5 text-reality-text-secondary">{label}</p>
        {icon ? <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-reality-surfaceBrand text-reality-brandEmphasis">{icon}</div> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold leading-9 tracking-tight text-reality-text-primary sm:text-4xl">
        {loading ? <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-reality-surfaceMuted align-middle" aria-label="Loading metric" /> : value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-reality-text-quaternary">{detail}</p>
      ) : null}
    </div>
  );
}

