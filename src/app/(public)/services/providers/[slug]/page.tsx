"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { EmptyMarketplaceState, LoadingPlaceholder } from "@/components/services/marketplace-states";
import { ProviderReviewsSection } from "@/components/services/provider-reviews-section";
import { ProviderProfileHeader } from "@/components/services/provider-profile-header";
import { RequestQuoteButton } from "@/components/services/request-quote-button";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Badge } from "@/components/ui/badge";
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
  const portfolioItems = provider.portfolio?.items ?? [];

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
                description={
                  provider.portfolio?.message ??
                  "Approved portfolio samples will appear here when available."
                }
              />
              {portfolioItems.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {portfolioItems.map((item) => (
                    <div className="overflow-hidden rounded-md border border-white/10" key={item.id}>
                      <div className="relative aspect-[4/3] bg-white/5">
                        <Image
                          alt={item.caption || `${provider.business_name} portfolio image`}
                          className="object-cover"
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          src={item.image_url}
                        />
                      </div>
                      {item.caption ? (
                        <p className="px-3 py-2 text-sm text-brand-muted">{item.caption}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-md border border-dashed border-white/15 bg-white/5 p-5 text-sm text-brand-muted">
                  No approved portfolio images have been published yet.
                </div>
              )}
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
                <VerificationBadgeStack
                  badges={[...provider.verification_badges, ...(provider.review_trust_signals ?? [])]}
                />
              </div>
            </Card>

            <ProviderReviewsSection provider={provider} />
          </div>

          <aside className="h-fit rounded-md border border-white/10 bg-brand-surface p-5 shadow-glow lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-secondary">
              Next action
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold">Request Quote</h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Share your project scope, contact details, and preferred start date. This is a
              quotation request only, not a booking or payment.
            </p>
            <div className="mt-5">
              <RequestQuoteButton provider={provider} />
            </div>
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
