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
      <main className="mx-auto min-h-screen max-w-3xl bg-white px-5 py-10 text-reality-text-primary [color-scheme:light] sm:px-6">
        <SectionHeader
          variant="reality"
          title="Transactions"
          description="Track payment milestones and proof status for your deals."
        />

        <section className="mt-6">
          {isLoading ? (
            <p className="text-sm text-reality-text-secondary">Loading...</p>
          ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
            <div className="grid gap-3">
              {transactionsQuery.data.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions/${transaction.id}`}
                >
                  <Card className="flex items-center justify-between p-4" variant="reality">
                    <div>
                      <p className="font-medium text-reality-text-primary">
                        Transaction {transaction.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-reality-text-secondary">
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
            <p className="text-sm text-reality-text-secondary">
              No transactions yet.
            </p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}

