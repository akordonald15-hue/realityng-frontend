"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { PageContainer } from "@/components/layout/page-container";
import { PublicShell } from "@/components/layout/public-shell";
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
      <PublicShell variant="reality">
        <main className="min-h-screen bg-white text-reality-text-primary">
        <PageContainer className="py-12">
          <LoadingPlaceholder label="Loading service provider profile" />
        </PageContainer>
        </main>
      </PublicShell>
    );
  }

  if (providerQuery.isError || !providerQuery.data) {
    return (
      <PublicShell variant="reality">
        <main className="min-h-screen bg-white text-reality-text-primary">
        <PageContainer className="py-12">
          <EmptyMarketplaceState
            title="Service provider not found"
            description="This profile may still be in review or unavailable publicly."
          />
        </PageContainer>
        </main>
      </PublicShell>
    );
  }

  const provider = providerQuery.data;
  const portfolioItems = provider.portfolio?.items ?? [];

  return (
    <PublicShell variant="reality">
      <main className="min-h-screen bg-white text-reality-text-primary">
      <PageContainer className="pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-reality-text-quaternary"
        >
          <Link className="transition hover:text-reality-brand-600" href="/dashboard">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <Link className="transition hover:text-reality-brand-600" href="/services">
            Artisans
          </Link>
          <span aria-hidden="true">/</span>
          <span>{provider.business_name}</span>
        </nav>
      </PageContainer>
      <ProviderProfileHeader provider={provider} />
      <section className="py-12">
        <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Card className="p-6" variant="reality">
              <SectionHeader
                eyebrow="About"
                title="Provider biography"
                description={provider.biography || "This provider will add a full biography soon."}
                variant="reality"
              />
            </Card>

            <Card className="p-6" variant="reality">
              <SectionHeader
                eyebrow="Trades"
                title="Service categories"
                description="Each provider can support multiple trades. Primary trade is shown first."
                variant="reality"
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {provider.trades.map((trade) => (
                  <Badge key={trade.id} variant={trade.is_primary ? "approved" : "reality"}>
                    {trade.category.name}
                    {trade.years_experience ? ` · ${trade.years_experience} yrs` : ""}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6" variant="reality">
              <SectionHeader
                eyebrow="Portfolio"
                title="Work samples"
                description={
                  provider.portfolio?.message ??
                  "Approved portfolio samples will appear here when available."
                }
                variant="reality"
              />
              {portfolioItems.length > 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {portfolioItems.map((item) => (
                    <div className="overflow-hidden rounded-[22px] border border-reality-border-secondary" key={item.id}>
                      <div className="relative aspect-[4/3] bg-reality-bg-subtle">
                        <Image
                          alt={item.caption || `${provider.business_name} portfolio image`}
                          className="object-cover"
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          src={item.image_url}
                        />
                      </div>
                      {item.caption ? (
                        <p className="px-3 py-2 text-sm text-reality-text-secondary">{item.caption}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[22px] border border-dashed border-reality-border-primary bg-reality-bg-subtle p-5 text-sm text-reality-text-secondary">
                  No approved portfolio images have been published yet.
                </div>
              )}
            </Card>

            <Card className="p-6" variant="reality">
              <SectionHeader
                eyebrow="Trust"
                title="Verification and reviews"
                description={
                  provider.reviews_summary?.message ??
                  "Verified booking reviews will be available in a later Sprint 9 phase."
                }
                variant="reality"
              />
              <div className="mt-6">
                <VerificationBadgeStack
                  badges={[...provider.verification_badges, ...(provider.review_trust_signals ?? [])]}
                  variant="reality"
                />
              </div>
            </Card>

            <ProviderReviewsSection provider={provider} variant="reality" />
          </div>

          <aside className="h-fit rounded-[28px] border border-reality-border-secondary bg-white p-5 shadow-reality-sm lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-reality-brand-600">
              Next action
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-reality-text-primary">Request Quote</h2>
            <p className="mt-3 text-sm leading-6 text-reality-text-secondary">
              Share your project scope, contact details, and preferred start date. This is a
              quotation request only, not a booking or payment.
            </p>
            <div className="mt-5">
              <RequestQuoteButton provider={provider} />
            </div>
            <Link
              className="mt-4 block text-center text-sm font-semibold text-reality-brand-600"
              href="/services"
            >
              Back to services
            </Link>
          </aside>
        </div>
        </PageContainer>
      </section>
      </main>
    </PublicShell>
  );
}
