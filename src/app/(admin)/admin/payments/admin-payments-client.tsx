"use client";

import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export function AdminPaymentsClient() {
  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Financial operations"
          title="Payments and escrow"
          description="Monitor transaction proof tracking and provider-backed escrow orchestration."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/admin/payments/escrow">
            <Card className="p-5 transition hover:bg-white/[0.06]">
              <h2 className="font-semibold text-brand-text">Escrow operations</h2>
              <p className="mt-2 text-sm text-brand-muted">
                Review funding, release, refund and reconciliation status.
              </p>
            </Card>
          </Link>
        </div>
      </main>
    </ProtectedRoute>
  );
}
