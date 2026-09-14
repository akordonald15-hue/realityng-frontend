import { ProviderLocation } from "@/components/services/provider-location";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
import type { ServiceProvider } from "@/lib/api/services";

type ProviderProfileHeaderProps = {
  provider: ServiceProvider;
};

export function ProviderProfileHeader({ provider }: ProviderProfileHeaderProps) {
  return (
    <section className="bg-white px-4 pb-10 pt-14 text-reality-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-reality text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-reality-border-secondary bg-reality-bg-subtle font-display text-3xl font-semibold text-reality-brand-700 shadow-reality-sm">
          {(provider.business_name || "R").slice(0, 2)}
        </div>
        <div className="mt-8">
          <Badge variant="approved">
            {provider.primary_trade?.category.name ?? "Verified service provider"}
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            {provider.business_name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-reality-text-secondary">
            {provider.headline || provider.biography || "Professional property service provider."}
          </p>
          <div className="mt-5 flex justify-center">
            <VerificationBadgeStack badges={provider.verification_badges} variant="reality" />
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-[28px] border border-reality-border-secondary bg-white p-5 text-left shadow-reality-sm sm:grid-cols-3">
          <div className="sm:col-span-1">
            <p className="text-2xl font-semibold text-reality-text-primary">
              {Number(provider.average_rating) > 0 ? provider.average_rating : "New"}
            </p>
            <p className="text-xs text-reality-text-secondary">Rating</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-2xl font-semibold text-reality-text-primary">
              {provider.completed_jobs_count}
            </p>
            <p className="text-xs text-reality-text-secondary">Completed jobs</p>
          </div>
          <div className="sm:col-span-1">
            <ProviderLocation
              displayLocation={provider.display_location}
              serviceAreas={provider.service_areas}
              variant="reality"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

