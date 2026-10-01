"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
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
      <main className="min-h-screen bg-reality-canvas px-5 py-10 text-reality-text-primary [color-scheme:light] sm:px-6 lg:py-14">
        <div className="mx-auto max-w-4xl">
        <SectionHeader
          eyebrow="Buyer finance"
          variant="reality"
          title="Transactions"
          description="Track payment milestones and proof status for your deals."
        />

        <section className="mt-6">
          {isLoading ? (
            <div aria-label="Loading transactions" className="grid gap-3">
              {[0, 1, 2].map((item) => <div className="h-24 animate-pulse rounded-reality bg-reality-surfaceMuted" key={item} />)}
            </div>
          ) : transactionsQuery.isError ? (
            <Card className="border-red-200 bg-red-50 p-6" variant="reality">
              <p className="font-semibold text-red-900">Transactions could not be loaded</p>
              <p className="mt-2 text-sm text-red-800">Check your connection and try again.</p>
              <Button className="mt-4" onClick={() => void transactionsQuery.refetch()} variant="realitySecondary">Try again</Button>
            </Card>
          ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
            <div className="grid gap-3">
              {transactionsQuery.data.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/dashboard/transactions/${transaction.id}`}
                >
                  <Card className="flex items-center justify-between gap-4 p-5 transition hover:border-reality-brand-300 hover:shadow-reality-sm" variant="reality">
                    <div>
                      <p className="font-medium text-reality-text-primary">
                        Transaction {transaction.id.slice(0, 8)}
                      </p>
                      <p className="mt-2 text-sm text-reality-text-secondary">
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
            <Card className="border-dashed bg-reality-surfaceMuted p-6" variant="reality">
              <p className="font-semibold text-reality-text-primary">No transactions yet</p>
              <p className="mt-2 text-sm leading-6 text-reality-text-secondary">Payment milestones and supported deal activity will appear here when a transaction starts.</p>
            </Card>
          )}
        </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
