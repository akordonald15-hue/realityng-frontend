"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppealList } from "@/components/services/governance-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  adminListAppeals,
  adminModerateAppeal,
  type ProviderAppeal,
} from "@/lib/api/services";

export default function AdminServiceAppealsPage() {
  const queryClient = useQueryClient();
  const appealsQuery = useQuery({
    queryKey: ["admin-service-appeals"],
    queryFn: () => adminListAppeals(),
  });
  const moderationMutation = useMutation({
    mutationFn: ({
      appeal,
      action,
    }: {
      appeal: ProviderAppeal;
      action: "approve" | "reject" | "reopen";
    }) => adminModerateAppeal(appeal.id, action, `${action} by services operations`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-service-appeals"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services moderation"
          title="Provider appeals"
          description="Review warning and suspension appeals without exposing moderation notes publicly."
        />

        <div className="mt-8 space-y-5">
          {appealsQuery.isLoading ? (
            <Card className="p-5 text-brand-muted">Loading appeals...</Card>
          ) : (
            <AppealList appeals={appealsQuery.data?.results ?? []} />
          )}
          {appealsQuery.data?.results.map((appeal) => (
            <Card className="p-4" key={`${appeal.id}-actions`}>
              <p className="text-sm text-brand-muted">
                Admin actions for {appeal.provider.business_name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["approve", "reject", "reopen"] as const).map((action) => (
                  <Button
                    disabled={moderationMutation.isPending}
                    key={action}
                    onClick={() => moderationMutation.mutate({ appeal, action })}
                    variant={action === "approve" ? "primary" : "secondary"}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}
