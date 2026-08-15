"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export default function TransactionFinancingPage() {
  const params = useParams<{ id: string }>();
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          title="Transaction financing"
          description="Start a private financing application linked to this transaction."
        />
        <Card className="mt-6 p-4">
          <h2 className="text-lg font-semibold text-brand-text">Finance this transaction</h2>
          <p className="mt-2 text-sm text-brand-muted">
            RealityNG will collect your consent and documents, then coordinate manual partner
            review. The partner owns underwriting, rates, approval and repayment.
          </p>
          <Link
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand-secondary px-4 text-sm font-semibold text-brand-background"
            href={`/dashboard/financing/apply?transaction_id=${params.id}`}
          >
            Start financing application
          </Link>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
