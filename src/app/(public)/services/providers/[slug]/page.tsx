"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { EmptyMarketplaceState, LoadingPlaceholder } from "@/components/services/marketplace-states";
import { ProviderProfileHeader } from "@/components/services/provider-profile-header";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getServiceProvider } from "@/lib/api/services";

export default function ServiceProviderProfilePage() {
  const params = useParams<{ slug: string }>();
  const providerQuery = useQuery({
    queryKey: ["service-provider", params.slug],
    queryFn: () => getServiceProvider(params.slug),
    enabled: Boolean(params.slug),
  });

  if (providerQuery.isLoading) {
    return (
      <main className="min-h-screen bg-brand-background text-brand-text">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <LoadingPlaceholder label="Loading service provider profile" />
        </div>
        <Footer />
      </main>
    );
  }

  if (providerQuery.isError || !providerQuery.data) {
    return (
      <main className="min-h-screen bg-brand-background text-brand-text">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <EmptyMarketplaceState
            title="Service provider not found"
            description="This profile may still be in review or unavailable publicly."
          />
        </div>
        <Footer />
      </main>
    );
  }

  const provider = providerQuery.data;

  return (
    <main className="min-h-screen bg-brand-background text-brand-text">
      <Navbar />
      <ProviderProfileHeader provider={provider} />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Card className="p-6">
              <SectionHeader
                eyebrow="About"
                title="Provider biography"
                description={provider.biography || "This provider will add a full biography soon."}
              />
            </Card>

            <Card className="p-6">
              <SectionHeader
                eyebrow="Trades"
                title="Service categories"
                description="Each provider can support multiple trades. Primary trade is shown first."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {provider.trades.map((trade) => (
                  <Badge key={trade.id} variant={trade.is_primary ? "gold" : "muted"}>
                    {trade.category.name}
                    {trade.years_experience ? ` · ${trade.years_experience} yrs` : ""}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                eyebrow="Portfolio"
                title="Work samples"
                description={provider.portfolio?.message ?? "Portfolio uploads are coming soon."}
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-white/15 bg-white/5 text-sm text-brand-muted"
                    key={item}
                  >
                    Portfolio placeholder
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <SectionHeader
                eyebrow="Trust"
                title="Verification and reviews"
                description={
                  provider.reviews_summary?.message ??
                  "Verified booking reviews will be available in a later Sprint 9 phase."
                }
              />
              <div className="mt-6">
                <VerificationBadgeStack badges={provider.verification_badges} />
              </div>
            </Card>
          </div>

          <aside className="h-fit rounded-md border border-white/10 bg-brand-surface p-5 shadow-glow lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-secondary">
              Next action
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold">Request Quote</h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Quote requests are planned for Sprint 9.3. This button is intentionally disabled
              during the marketplace foundation release.
            </p>
            <Button className="mt-5 w-full" disabled>
              Request Quote
            </Button>
            <Link
              className="mt-4 block text-center text-sm font-semibold text-brand-secondary"
              href="/services"
            >
              Back to services
            </Link>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
