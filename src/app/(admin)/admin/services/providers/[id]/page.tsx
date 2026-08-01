"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminProviderDecisionForm } from "@/components/services/admin-provider-decision-form";
import { ProviderCompletenessChecklist } from "@/components/services/provider-completeness-checklist";
import { ProviderStatusBadge } from "@/components/services/provider-status-badge";
import { VerificationBadgeStack } from "@/components/services/verification-badge-stack";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { adminGetServiceProvider } from "@/lib/api/services";

export default function AdminServiceProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const providerQuery = useQuery({
    queryKey: ["admin-service-provider", params.id],
    queryFn: () => adminGetServiceProvider(params.id),
    enabled: Boolean(params.id),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link className="text-sm font-semibold text-brand-secondary" href="/admin/services/providers">
          Back to provider queue
        </Link>
        {providerQuery.isLoading ? (
          <Card className="mt-6 p-5 text-brand-muted">Loading provider...</Card>
        ) : providerQuery.data ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-6">
              <Card className="p-6">
                <ProviderStatusBadge status={providerQuery.data.status} />
                <SectionHeader
                  eyebrow="Provider review"
                  title={providerQuery.data.business_name || "Untitled provider"}
                  description={providerQuery.data.headline || "No headline supplied yet."}
                />
                <p className="mt-4 text-sm leading-6 text-brand-muted">
                  {providerQuery.data.biography || "No biography supplied yet."}
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">Trades</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {providerQuery.data.trades.map((trade) => (
                    <span
                      className="rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-muted"
                      key={trade.id}
                    >
                      {trade.category.name}
                      {trade.is_primary ? " - primary" : ""}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">Service areas</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {providerQuery.data.service_areas.map((area) => (
                    <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-brand-muted" key={area.id}>
                      {[area.neighborhood, area.lga, area.city, area.state].filter(Boolean).join(", ")}
                      {area.is_primary ? " - primary" : ""}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-heading text-2xl font-semibold text-brand-text">
                  Verification snapshot
                </h2>
                <div className="mt-4">
                  <VerificationBadgeStack badges={providerQuery.data.verification_badges} />
                </div>
              </Card>
            </div>
            <aside className="space-y-6">
              <ProviderCompletenessChecklist completion={providerQuery.data.completion} />
              <Card className="p-5">
                <h2 className="mb-4 font-heading text-2xl font-semibold text-brand-text">
                  Moderation
                </h2>
                <AdminProviderDecisionForm provider={providerQuery.data} />
              </Card>
            </aside>
          </div>
        ) : (
          <Card className="mt-6 p-5 text-brand-muted">Provider not found.</Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
