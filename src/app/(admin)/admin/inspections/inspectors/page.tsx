"use client";

import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { adminListInspectors } from "@/lib/api/inspections";

export default function AdminInspectorsPage() {
  const inspectorsQuery = useQuery({
    queryKey: ["inspection-admin-inspectors"],
    queryFn: adminListInspectors,
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Admin"
          title="Inspector directory"
          description="Approved inspector profiles available for assignment. Profile lifecycle remains controlled by RealityNG operations."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {inspectorsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading inspectors...</Card>
          ) : null}
          {inspectorsQuery.data?.map((inspector) => (
            <Card className="p-5" key={inspector.id}>
              <p className="font-heading text-2xl font-semibold text-brand-text">
                {inspector.display_name || inspector.user.full_name}
              </p>
              <p className="mt-1 text-sm text-brand-muted">{inspector.professional_title}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                <span>{inspector.verification_status}</span>
                <span>{inspector.availability_status}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-muted">{inspector.bio}</p>
            </Card>
          ))}
          {inspectorsQuery.data?.length === 0 ? (
            <Card className="p-5 text-sm text-brand-muted">No inspector profiles configured yet.</Card>
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}
