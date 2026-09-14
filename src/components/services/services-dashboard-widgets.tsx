import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import type {
  DashboardActivityItem,
  DashboardBreakdownItem,
  DashboardStat,
} from "@/lib/api/services";

export function DashboardStatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-reality-text-secondary">{stat.label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-reality-brand-600">
        {stat.value}
      </p>
      {stat.detail ? <p className="mt-2 text-xs leading-5 text-reality-text-secondary">{stat.detail}</p> : null}
    </Card>
  );
}

export function DashboardStatGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <DashboardStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

export function DashboardSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-reality-text-primary">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-reality-text-secondary">{description}</p> : null}
        </div>
        {action ? (
          <Link className="text-sm font-semibold text-reality-brand-600" href={action.href}>
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function EmptyDashboardState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-reality-border-secondary bg-reality-bg-subtle p-4 text-sm text-reality-text-secondary">
      {message}
    </div>
  );
}

export function ActivityTimeline({ activity }: { activity: DashboardActivityItem[] }) {
  if (activity.length === 0) {
    return <EmptyDashboardState message="No recent service activity yet." />;
  }
  return (
    <div className="space-y-3">
      {activity.map((item) => {
        const content = (
          <div className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-4 transition hover:border-brand-secondary/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-reality-text-primary">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-reality-text-secondary">{item.description}</p>
                ) : null}
              </div>
              {item.status ? (
                <span className="rounded-full bg-brand-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-reality-brand-600">
                  {item.status.replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-reality-text-secondary">
              {new Date(item.timestamp).toLocaleDateString()}
            </p>
          </div>
        );
        return item.href ? (
          <Link className="block" href={item.href} key={item.id}>
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}

export function QuickActionGrid({
  actions,
}: {
  actions: { href: string; label: string; description: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => (
        <Link
          className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-4 transition hover:border-brand-secondary/60"
          href={action.href}
          key={action.href}
        >
          <p className="font-semibold text-reality-text-primary">{action.label}</p>
          <p className="mt-1 text-sm leading-5 text-reality-text-secondary">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function BreakdownList({ items }: { items: DashboardBreakdownItem[] }) {
  if (items.length === 0) {
    return <EmptyDashboardState message="No breakdown data is available yet." />;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-reality-text-primary">{item.label}</span>
            <span className="text-reality-text-secondary">{item.value}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-reality-bg-muted">
            <div
              className="h-2 rounded-full bg-brand-secondary"
              style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

