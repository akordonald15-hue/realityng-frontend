"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FinancingApplicationCard } from "@/components/payments/financing-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { listAdminFinancingApplications } from "@/lib/api/financing";

export default function AdminFinancingPage() {
  const applicationsQuery = useQuery({
    queryKey: ["admin", "financing", "applications"],
    queryFn: () => listAdminFinancingApplications(),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-5xl p-4">
        <SectionHeader
          title="Financing operations"
          description="Review private financing applications, coordinate partner handoff and record partner-owned offers."
        />

        <section className="mt-6 grid gap-3">
          {applicationsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading financing queue...</p>
          ) : applicationsQuery.data?.length ? (
            applicationsQuery.data.map((application) => (
              <Link href={`/admin/financing/${application.id}`} key={application.id}>
                <FinancingApplicationCard application={application} />
              </Link>
            ))
          ) : (
            <Card className="p-4">
              <p className="text-sm text-brand-muted">No financing applications in queue.</p>
            </Card>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
