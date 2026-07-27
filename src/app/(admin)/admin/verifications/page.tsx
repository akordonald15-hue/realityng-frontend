"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  listAdminVerificationRequests,
  listAdminPropertyVerifications,
  performVerificationAction,
  performPropertyVerificationAction,
  type AdminActionPayload,
  type AdminVerificationAction,
} from "@/lib/api/admin-verification";

function ActionButtons({
  onAction,
  pendingAction,
}: {
  onAction: (action: AdminVerificationAction) => void;
  pendingAction: AdminVerificationAction | null;
}) {
  const actions: { action: AdminVerificationAction; label: string; variant?: "primary" | "secondary" }[] = [
    { action: "approve", label: "Approve", variant: "primary" },
    { action: "reject", label: "Reject", variant: "secondary" },
    { action: "request-info", label: "Request info", variant: "secondary" },
    { action: "suspend", label: "Suspend", variant: "secondary" },
    { action: "expire", label: "Expire", variant: "secondary" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ action, label, variant }) => (
        <Button
          key={action}
          type="button"
          variant={variant}
          className="text-xs"
          disabled={pendingAction !== null}
          onClick={() => onAction(action)}
        >
          {pendingAction === action ? "Working..." : label}
        </Button>
      ))}
    </div>
  );
}

export default function AdminVerificationsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AdminVerificationAction | null>(null);

  const businessQuery = useQuery({
    queryKey: ["admin-verification-requests"],
    queryFn: () => listAdminVerificationRequests(),
  });

  const propertyQuery = useQuery({
    queryKey: ["admin-property-verifications"],
    queryFn: () => listAdminPropertyVerifications(),
  });

  const isLoading = businessQuery.isLoading || propertyQuery.isLoading;

  function getActionPayload(action: AdminVerificationAction): AdminActionPayload | null {
    if (action === "reject") {
      const reason = window.prompt("Enter the rejection reason.");
      if (!reason?.trim()) return null;
      return { rejection_reason: reason.trim(), review_notes: reason.trim() };
    }

    if (action === "request-info") {
      const note = window.prompt("Enter the information needed from the submitter.");
      if (!note?.trim()) return null;
      return { rejection_reason: note.trim(), review_notes: note.trim() };
    }

    if (action === "suspend" || action === "expire") {
      const note = window.prompt("Optional review note.");
      if (note === null) return null;
      return note.trim() ? { review_notes: note.trim() } : {};
    }

    return {};
  }

  const businessMutation = useMutation({
    mutationFn: ({
      id,
      action,
      payload,
    }: {
      id: string;
      action: AdminVerificationAction;
      payload: AdminActionPayload;
    }) => performVerificationAction(id, action, payload),
    onMutate: ({ id, action }) => {
      setActionError("");
      setPendingId(id);
      setPendingAction(action);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
    onSettled: () => {
      setPendingId(null);
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ["admin-verification-requests"] });
    },
  });

  const propertyMutation = useMutation({
    mutationFn: ({
      id,
      action,
      payload,
    }: {
      id: string;
      action: AdminVerificationAction;
      payload: AdminActionPayload;
    }) => performPropertyVerificationAction(id, action, payload),
    onMutate: ({ id, action }) => {
      setActionError("");
      setPendingId(id);
      setPendingAction(action);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
    onSettled: () => {
      setPendingId(null);
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ["admin-property-verifications"] });
    },
  });

  return (
    <ProtectedRoute requireAdmin>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          eyebrow="Admin"
          title="Verification Review"
          description="Approve, reject, or manage submitted verification requests."
        />

        {actionError ? <FormMessage tone="error">{actionError}</FormMessage> : null}

        <section className="mt-6">
          <h2 className="mb-2 text-lg font-semibold text-brand-text">
            Business &amp; Artisan Verifications
          </h2>

          {isLoading ? (
            <p className="text-sm text-brand-muted">Loading...</p>
          ) : businessQuery.data && businessQuery.data.results.length > 0 ? (
            <div className="grid gap-3">
              {businessQuery.data.results.map((request) => (
                <Card key={request.id} className="flex flex-col gap-3 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brand-text">{request.business_name}</p>
                    <VerificationStatusBadge status={request.status} />
                  </div>
                  <p className="text-xs text-brand-muted">
                    {request.trade_category} &middot; {request.city}
                  </p>
                  <ActionButtons
                    pendingAction={pendingId === request.id ? pendingAction : null}
                    onAction={(action) => {
                      const payload = getActionPayload(action);
                      if (payload === null) return;
                      businessMutation.mutate({ id: request.id, action, payload });
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">No business or artisan verification requests yet.</p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-brand-text">Property Verifications</h2>

          {isLoading ? (
            <p className="text-sm text-brand-muted">Loading...</p>
          ) : propertyQuery.data && propertyQuery.data.results.length > 0 ? (
            <div className="grid gap-3">
              {propertyQuery.data.results.map((verification) => (
                <Card key={verification.id} className="flex flex-col gap-3 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brand-text">Property {verification.property}</p>
                    <VerificationStatusBadge status={verification.status} />
                  </div>
                  <ActionButtons
                    pendingAction={pendingId === verification.id ? pendingAction : null}
                    onAction={(action) => {
                      const payload = getActionPayload(action);
                      if (payload === null) return;
                      propertyMutation.mutate({ id: verification.id, action, payload });
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-muted">No property verification requests yet.</p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
