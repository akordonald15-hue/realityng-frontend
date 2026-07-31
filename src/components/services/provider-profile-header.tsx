import { ProviderLocation } from "@/components/services/provider-location";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
import type { ServiceProvider } from "@/lib/api/services";

type ProviderProfileHeaderProps = {
  provider: ServiceProvider;
};

export function ProviderProfileHeader({ provider }: ProviderProfileHeaderProps) {
  return (
    <section className="bg-brand-background px-4 py-12 text-brand-text sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <Badge>{provider.primary_trade?.category.name ?? "Verified service provider"}</Badge>
          <h1 className="mt-5 font-heading text-4xl font-semibold sm:text-5xl">
            {provider.business_name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-brand-muted">{provider.headline}</p>
          <div className="mt-6">
            <VerificationBadgeStack badges={provider.verification_badges} />
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-brand-surface p-5 shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-secondary">
            Service base
          </p>
          <div className="mt-4">
            <ProviderLocation
              displayLocation={provider.display_location}
              serviceAreas={provider.service_areas}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
            <div>
              <p className="text-2xl font-bold text-brand-text">{provider.average_rating}</p>
              <p className="text-xs text-brand-muted">Rating placeholder</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">{provider.completed_jobs_count}</p>
              <p className="text-xs text-brand-muted">Completed jobs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
