"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FinancingApplicationCard, FinancingProductCard } from "@/components/payments/financing-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listFinancingApplications, listFinancingProducts } from "@/lib/api/financing";

export default function FinancingDashboardPage() {
  const applicationsQuery = useQuery({
    queryKey: ["financing", "applications"],
    queryFn: () => listFinancingApplications(),
  });
  const productsQuery = useQuery({
    queryKey: ["financing", "products"],
    queryFn: () => listFinancingProducts(),
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Financing"
          description="Apply for partner-reviewed rent finance or mortgage support. RealityNG coordinates the workflow but does not lend or underwrite."
        />

        <section className="mt-6 grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-text">Your applications</h2>
            <Link className="text-sm font-semibold text-brand-secondary" href="/dashboard/financing/apply">
              New application
            </Link>
          </div>
          {applicationsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading applications...</p>
          ) : applicationsQuery.data?.length ? (
            <div className="grid gap-3">
              {applicationsQuery.data.map((application) => (
                <Link href={`/dashboard/financing/${application.id}`} key={application.id}>
                  <FinancingApplicationCard application={application} />
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <p className="text-sm text-brand-muted">
                You do not have a financing application yet.
              </p>
            </Card>
          )}
        </section>

        <section className="mt-8 grid gap-3">
          <h2 className="text-lg font-semibold text-brand-text">Available products</h2>
          {productsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading products...</p>
          ) : (
            productsQuery.data?.map((product) => (
              <FinancingProductCard key={product.id} product={product} />
            ))
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
