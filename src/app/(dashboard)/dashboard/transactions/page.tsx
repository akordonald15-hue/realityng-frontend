"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { TransactionStatusBadge } from "@/components/payments/transaction-status-badge";
import { listTransactions } from "@/lib/api/payments";

export default function TransactionsPage() {
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => listTransactions(),
  });

  const isLoading = transactionsQuery.isLoading;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          title="Transactions"
          description="Track payment milestones and proof status for your deals."
        />

        <section className="mt-6">
          {isLoading ? (
            <p className="text-sm text-brand-muted">Loading...</p>
          ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
            <div className="grid gap-3">
              {transactionsQuery.data.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions/${transaction.id}`}
                >
                  <Card className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-brand-text">
                        Transaction {transaction.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-brand-muted">
                        Property {transaction.property.slice(0, 8)} &middot;{" "}
                        {transaction.currency} &middot;{" "}
                        {transaction.milestones.length} milestone
                        {transaction.milestones.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <TransactionStatusBadge status={transaction.status} />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">
              No transactions yet.
            </p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
