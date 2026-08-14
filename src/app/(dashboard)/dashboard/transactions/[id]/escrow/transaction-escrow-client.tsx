"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { EscrowSimpleStatusBadge, EscrowStatusBadge } from "@/components/payments/escrow-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getTransaction,
  getTransactionEscrow,
  requestEscrowRefund,
  requestEscrowRelease,
  type EscrowCondition,
  type EscrowTransaction,
} from "@/lib/api/payments";

export function TransactionEscrowClient() {
  const params = useParams<{ id: string }>();
  const transactionId = params.id;
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const transactionQuery = useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: () => getTransaction(transactionId),
  });

  const escrowQuery = useQuery({
    queryKey: ["transactions", transactionId, "escrow"],
    queryFn: () => getTransactionEscrow(transactionId),
    retry: false,
  });

  const releaseMutation = useMutation({
    mutationFn: (escrowId: string) =>
      requestEscrowRelease({
        escrowId,
        payload: {
          reason: "Release requested from transaction escrow page.",
          idempotency_key: `release-${escrowId}`,
        },
      }),
    onMutate: () => setActionError(""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transactions", transactionId, "escrow"],
      });
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const refundMutation = useMutation({
    mutationFn: (escrowId: string) =>
      requestEscrowRefund({
        escrowId,
        payload: {
          reason: refundReason || "Refund requested from transaction escrow page.",
          idempotency_key: `refund-${escrowId}`,
        },
      }),
    onMutate: () => setActionError(""),
    onSuccess: async () => {
      setRefundReason("");
      await queryClient.invalidateQueries({
        queryKey: ["transactions", transactionId, "escrow"],
      });
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const escrow = escrowQuery.data;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-4xl p-4">
        <SectionHeader
          title="Escrow"
          description="Track provider-confirmed funding, release conditions and settlement status."
        />

        {transactionQuery.isLoading || escrowQuery.isLoading ? (
          <p className="mt-6 text-sm text-brand-muted">Loading escrow...</p>
        ) : escrowQuery.isError || !escrow ? (
          <Card className="mt-6 p-4">
            <h2 className="text-base font-semibold text-brand-text">Escrow not started</h2>
            <p className="mt-2 text-sm text-brand-muted">
              This transaction does not yet have an escrow record. Payment proof tracking can still
              continue from the transaction page.
            </p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            <EscrowSummary escrow={escrow} />

            {actionError ? (
              <p className="rounded-sm border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                {actionError}
              </p>
            ) : null}

            <Card className="p-4">
              <h2 className="text-base font-semibold text-brand-text">Release actions</h2>
              <p className="mt-1 text-sm text-brand-muted">
                A request does not mark funds as released. Settlement is only complete after the
                escrow partner confirms it.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={releaseMutation.isPending}
                  onClick={() => releaseMutation.mutate(escrow.id)}
                >
                  {releaseMutation.isPending ? "Requesting..." : "Request release"}
                </Button>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <input
                    className="min-h-11 flex-1 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-brand-text"
                    placeholder="Refund reason"
                    value={refundReason}
                    onChange={(event) => setRefundReason(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    disabled={refundMutation.isPending}
                    onClick={() => refundMutation.mutate(escrow.id)}
                  >
                    {refundMutation.isPending ? "Requesting..." : "Request refund"}
                  </Button>
                </div>
              </div>
            </Card>

            <ConditionsList conditions={escrow.conditions} />
            <Timeline escrow={escrow} />
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

function EscrowSummary({ escrow }: { escrow: EscrowTransaction }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            {escrow.provider.name}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-brand-text">
            {escrow.currency} {escrow.expected_amount}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Provider reference: {escrow.external_reference || "Not recorded"}
          </p>
        </div>
        <EscrowStatusBadge status={escrow.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Funding confirmed" value={`${escrow.currency} ${escrow.confirmed_funded_amount}`} />
        <Metric label="Expected fee" value={`${escrow.currency} ${escrow.expected_platform_fee}`} />
        <Metric label="Provider fee" value={`${escrow.currency} ${escrow.provider_fee}`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <EscrowSimpleStatusBadge status={escrow.funding_status} />
        <EscrowSimpleStatusBadge status={escrow.release_status} />
        <EscrowSimpleStatusBadge status={escrow.refund_status} />
        <EscrowSimpleStatusBadge status={escrow.reconciliation_status} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-1 font-semibold text-brand-text">{value}</p>
    </div>
  );
}

function ConditionsList({ conditions }: { conditions: EscrowCondition[] }) {
  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-brand-text">Release conditions</h2>
      {conditions.length === 0 ? (
        <p className="mt-2 text-sm text-brand-muted">No release conditions have been added.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className="flex items-center justify-between rounded-md border border-white/10 p-3"
            >
              <div>
                <p className="font-medium text-brand-text">
                  {condition.condition_type.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-brand-muted">
                  {condition.description || "Condition managed by RealityNG operations."}
                </p>
              </div>
              <EscrowSimpleStatusBadge status={condition.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Timeline({ escrow }: { escrow: EscrowTransaction }) {
  const items = [
    ...escrow.funding_events.map((event) => ({
      id: event.id,
      title: "Funding event",
      body: `${event.currency} ${event.amount} - ${event.event_type.replaceAll("_", " ")}`,
      date: event.occurred_at,
    })),
    ...escrow.releases.map((release) => ({
      id: release.id,
      title: "Release",
      body: `${release.currency} ${release.amount} - ${release.status.replaceAll("_", " ")}`,
      date: release.created_at,
    })),
    ...escrow.refunds.map((refund) => ({
      id: refund.id,
      title: "Refund",
      body: `${refund.currency} ${refund.amount} - ${refund.status.replaceAll("_", " ")}`,
      date: refund.created_at,
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <Card className="p-4">
      <h2 className="text-base font-semibold text-brand-text">Escrow timeline</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-brand-muted">No escrow events have been recorded yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-white/10 p-3">
              <p className="font-medium text-brand-text">{item.title}</p>
              <p className="text-sm text-brand-muted">{item.body}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {new Date(item.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
