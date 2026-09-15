"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FinanceOptionSelector } from "@/components/payments/finance-option-selector";
import { FinancingApplicationCard } from "@/components/payments/financing-widgets";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getApiErrorMessage } from "@/lib/api/errors";
import { listFinancingApplications, listFinancingProducts } from "@/lib/api/financing";

export default function FinancingDashboardPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>();
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
      <main className="min-h-screen bg-reality-canvas py-8 text-reality-text-primary sm:py-12">
        <PageContainer>
          <FinanceOptionSelector
            error={productsQuery.isError ? getApiErrorMessage(productsQuery.error) : undefined}
            isLoading={productsQuery.isLoading}
            onSelect={(product) => setSelectedProductId(product.id)}
            products={productsQuery.data ?? []}
            selectedProductId={selectedProductId}
          />

          <section className="mx-auto mt-8 grid w-full max-w-[620px] gap-4 rounded-[28px] border border-reality-border-secondary bg-reality-surface p-5 shadow-reality-xs sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-reality-text-primary">Your applications</h2>
              <Link
                className="text-sm font-semibold text-reality-brand-600 transition hover:text-reality-brand-700"
                href="/dashboard/financing/apply"
              >
                New application
              </Link>
            </div>
            {applicationsQuery.isLoading ? (
              <div className="h-20 animate-pulse rounded-[18px] bg-reality-surfaceMuted" aria-label="Loading applications" />
            ) : applicationsQuery.data?.length ? (
              <div className="grid gap-3">
                {applicationsQuery.data.map((application) => (
                  <Link href={`/dashboard/financing/${application.id}`} key={application.id}>
                    <FinancingApplicationCard application={application} />
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="rounded-[18px] border-dashed bg-reality-surfaceMuted p-5" variant="reality">
                <p className="text-sm text-reality-text-secondary">Your financing applications will appear here after you choose a partner product and start a draft.</p>
              </Card>
            )}
          </section>
        </PageContainer>
      </main>
    </ProtectedRoute>
  );
}

