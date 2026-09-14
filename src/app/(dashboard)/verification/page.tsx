"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listVerificationRequests } from "@/lib/api/verification";
import { listPropertyVerifications } from "@/lib/api/property-verification";

export default function VerificationCenterPage() {
  const businessQuery = useQuery({
    queryKey: ["verification-requests"],
    queryFn: () => listVerificationRequests(),
  });

  const propertyQuery = useQuery({
    queryKey: ["property-verifications"],
    queryFn: () => listPropertyVerifications(),
  });

  const isLoading = businessQuery.isLoading || propertyQuery.isLoading;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          title="Verification Center"
          description="Track the status of your submitted verification requests."
        />

        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-reality-text-primary">
              Business &amp; Artisan Verifications
            </h2>
            <Link
              href="/verification/new"
              className="text-sm font-medium text-reality-brand-600"
            >
              New request
            </Link>
          </div>

          {isLoading ? (
            <p className="text-sm text-reality-text-secondary">Loading...</p>
          ) : businessQuery.data && businessQuery.data.results.length > 0 ? (
            <div className="grid gap-3">
              {businessQuery.data.results.map((request) => (
                <Card key={request.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium text-reality-text-primary">
                      {request.business_name}
                    </p>
                    <p className="text-xs text-reality-text-secondary">
                      {request.trade_category} &middot; {request.city}
                    </p>
                  </div>
                  <VerificationStatusBadge status={request.status} />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-reality-text-secondary">
              No business or artisan verification requests yet.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-reality-text-primary">
            Property Verifications
          </h2>

          {isLoading ? (
            <p className="text-sm text-reality-text-secondary">Loading...</p>
          ) : propertyQuery.data && propertyQuery.data.results.length > 0 ? (
            <div className="grid gap-3">
              {propertyQuery.data.results.map((verification) => (
                <Card key={verification.id} className="flex items-center justify-between p-3">
                  <p className="font-medium text-reality-text-primary">
                    Property {verification.property}
                  </p>
                  <VerificationStatusBadge status={verification.status} />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-reality-text-secondary">
              No property verification requests yet. Start one from a
              property&apos;s page.
            </p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

