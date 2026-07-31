import Link from "next/link";

import { ProviderLocation } from "@/components/services/provider-location";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ServiceProvider } from "@/lib/api/services";

type ProviderCardProps = {
  provider: ServiceProvider;
};

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card className="flex h-full flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge>{provider.primary_trade?.category.name ?? "Service Provider"}</Badge>
          <h3 className="mt-3 font-heading text-2xl font-semibold text-brand-text">
            <Link
              className="transition hover:text-brand-secondary"
              href={`/services/providers/${provider.slug}`}
            >
              {provider.business_name}
            </Link>
          </h3>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
            {provider.provider_type.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p className="text-lg font-bold text-brand-text">{provider.average_rating}</p>
          <p className="text-xs text-brand-muted">rating</p>
        </div>
      </div>
      <p className="text-sm leading-6 text-brand-muted">{provider.headline}</p>
      <VerificationBadgeStack badges={provider.verification_badges} />
      <ProviderLocation
        displayLocation={provider.display_location}
        serviceAreas={provider.service_areas}
      />
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-brand-muted">
        <span>{provider.completed_jobs_count} completed jobs</span>
        <Link
          className="font-semibold text-brand-secondary transition hover:text-brand-lightGold"
          href={`/services/providers/${provider.slug}`}
        >
          View profile
        </Link>
      </div>
    </Card>
  );
}
