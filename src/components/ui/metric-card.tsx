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
        "rounded-[12px] border border-reality-border-secondary bg-white p-6 text-reality-text-primary shadow-reality-xs",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-5 text-reality-text-quaternary">{label}</p>
        {icon ? <div className="text-reality-brand-500">{icon}</div> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold leading-9 text-reality-text-primary">
        {loading ? "-" : value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-reality-text-quaternary">{detail}</p>
      ) : null}
    </div>
  );
}
