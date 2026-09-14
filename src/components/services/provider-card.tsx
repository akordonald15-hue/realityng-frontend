import Link from "next/link";

import { ProviderLocation } from "@/components/services/provider-location";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
import type { ServiceProvider } from "@/lib/api/services";

type ProviderCardProps = {
  provider: ServiceProvider;
};

export function ProviderCard({ provider }: ProviderCardProps) {
  const href = `/services/providers/${provider.slug}`;

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-reality-border-secondary bg-white shadow-reality-sm transition hover:-translate-y-1 hover:border-reality-brand-500/30 hover:shadow-[0_18px_44px_rgba(17,138,100,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
      href={href}
    >
      <div className="relative aspect-[1.13] bg-gradient-to-br from-reality-bg-muted to-reality-brand-50">
        <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-xs font-semibold text-reality-text-secondary backdrop-blur">
          {provider.provider_type === "company" ? "Company" : "Artisan"}
        </div>
        <div className="absolute right-4 top-4 h-5 w-5 rounded-full border border-white/80 bg-reality-brand-500 shadow-reality-sm" />
        <div className="flex h-full items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-reality-brand-500/15 bg-white text-center font-display text-3xl font-semibold text-reality-brand-700 shadow-reality-sm">
            {(provider.business_name || "R").slice(0, 2)}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="approved">
              {provider.primary_trade?.category.name ?? "Service Provider"}
            </Badge>
            <h3 className="mt-3 text-lg font-semibold text-reality-text-primary transition group-hover:text-reality-brand-600">
              {provider.business_name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-reality-text-secondary">
              {provider.headline || "Professional property services provider."}
            </p>
          </div>
          <div className="rounded-full border border-reality-border-secondary bg-reality-bg-subtle px-3 py-1 text-sm font-semibold text-reality-text-primary">
            {Number(provider.average_rating) > 0 ? provider.average_rating : "New"}
          </div>
        </div>

        <VerificationBadgeStack badges={provider.verification_badges} variant="reality" />
        <div>
          <ProviderLocation
            displayLocation={provider.display_location}
            serviceAreas={provider.service_areas}
            variant="reality"
          />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-reality-border-secondary pt-4 text-sm text-reality-text-secondary">
          <span>{provider.completed_jobs_count} completed jobs</span>
          <span className="font-semibold text-reality-brand-600">View profile</span>
        </div>
      </div>
    </Link>
  );
}

