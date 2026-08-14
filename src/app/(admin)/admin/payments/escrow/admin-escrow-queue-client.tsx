"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { EscrowSimpleStatusBadge, EscrowStatusBadge } from "@/components/payments/escrow-status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listEscrows } from "@/lib/api/payments";

export function AdminEscrowQueueClient() {
  const escrowsQuery = useQuery({
    queryKey: ["admin", "payment-escrows"],
    queryFn: listEscrows,
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Financial controls"
          title="Escrow operations"
          description="Review provider-backed escrow state, funding confirmations, releases, refunds and reconciliation exceptions."
        />

        {escrowsQuery.isLoading ? (
          <Card className="mt-8 p-5 text-brand-muted">Loading escrow queue...</Card>
        ) : null}

        {escrowsQuery.isError ? (
          <Card className="mt-8 p-5 text-red-200">
            Escrow operations could not be loaded.
          </Card>
        ) : null}

        {escrowsQuery.data ? (
          <div className="mt-8 overflow-hidden rounded-md border border-white/10">
            {escrowsQuery.data.length === 0 ? (
              <Card className="p-5 text-brand-muted">No escrow records found.</Card>
            ) : (
              <div className="divide-y divide-white/10">
                {escrowsQuery.data.map((escrow) => (
                  <Link
                    className="block bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
                    href={`/dashboard/transactions/${escrow.transaction}/escrow`}
                    key={escrow.id}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-brand-text">
                          Transaction {escrow.transaction.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-brand-muted">
                          {escrow.provider.name} - {escrow.currency} {escrow.expected_amount}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <EscrowStatusBadge status={escrow.status} />
                        <EscrowSimpleStatusBadge status={escrow.funding_status} />
                        <EscrowSimpleStatusBadge status={escrow.release_status} />
                        <EscrowSimpleStatusBadge status={escrow.reconciliation_status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
