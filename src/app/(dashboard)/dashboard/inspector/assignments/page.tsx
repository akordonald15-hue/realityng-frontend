"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AssignmentCard } from "@/components/inspections/inspection-widgets";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  acceptInspectionAssignment,
  declineInspectionAssignment,
  listInspectorAssignments,
} from "@/lib/api/inspections";

export default function InspectorAssignmentsPage() {
  const queryClient = useQueryClient();
  const assignmentsQuery = useQuery({
    queryKey: ["inspection-assignments"],
    queryFn: listInspectorAssignments,
  });
  const acceptMutation = useMutation({
    mutationFn: acceptInspectionAssignment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspection-assignments"] }),
  });
  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      declineInspectionAssignment(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspection-assignments"] }),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Inspector"
        title="Assignments"
        description="Accept or decline inspection assignments and open each request to create reports and evidence."
      />
      <div className="mt-8 grid gap-4">
        {assignmentsQuery.isLoading ? (
          <Card className="p-5 text-brand-muted">Loading assignments...</Card>
        ) : null}
        {assignmentsQuery.data?.map((assignment) => (
          <AssignmentCard
            assignment={assignment}
            key={assignment.id}
            onAccept={() => acceptMutation.mutate(assignment.id)}
            onDecline={(reason) => declineMutation.mutate({ id: assignment.id, reason })}
            pending={acceptMutation.isPending || declineMutation.isPending}
          />
        ))}
        {assignmentsQuery.data?.length === 0 ? (
          <Card className="p-5 text-sm text-brand-muted">No assignments are currently open.</Card>
        ) : null}
      </div>
    </main>
  );
}
