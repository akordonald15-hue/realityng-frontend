"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { TransactionStatusBadge } from "@/components/payments/transaction-status-badge";
import { MilestoneStatusBadge } from "@/components/payments/milestone-status-badge";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getTransaction,
  submitPaymentProof,
  acceptMilestone,
  rejectMilestone,
  disputeMilestone,
  type PaymentMilestone,
} from "@/lib/api/payments";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const transactionId = params.id;
  const queryClient = useQueryClient();

  const [pendingId, setPendingId] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [actionError, setActionError] = useState("");

  const transactionQuery = useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: () => getTransaction(transactionId),
  });

  const proofMutation = useMutation({
    mutationFn: ({
      milestoneId,
      file,
      note,
      amountClaimed,
      reference,
    }: {
      milestoneId: string;
      file: File;
      note: string;
      amountClaimed: string;
      reference: string;
    }) =>
      submitPaymentProof({
        milestoneId,
        payload: {
          file,
          note,
          amount_claimed: amountClaimed,
          reference,
        },
      }),
    onMutate: ({ milestoneId }) => {
      setActionError("");
      setPendingId(milestoneId);
      setPendingAction("proof");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transactions", transactionId],
      });
      setPendingId("");
      setPendingAction("");
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
      setPendingId("");
      setPendingAction("");
    },
  });

  const milestoneActionMutation = useMutation({
    mutationFn: async ({
      milestoneId,
      action,
    }: {
      milestoneId: string;
      action: "accept" | "reject" | "dispute";
    }): Promise<void> => {
      if (action === "accept") {
        await acceptMilestone(milestoneId);
        return;
      }
      if (action === "reject") {
        await rejectMilestone(milestoneId);
        return;
      }
      await disputeMilestone(milestoneId, "Disputed from transaction detail page");
    },
    onMutate: ({ milestoneId, action }) => {
      setActionError("");
      setPendingId(milestoneId);
      setPendingAction(action);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transactions", transactionId],
      });
      setPendingId("");
      setPendingAction("");
    },
    onError: (error) => {
      setActionError(getApiErrorMessage(error));
      setPendingId("");
      setPendingAction("");
    },
  });

  const isLoading = transactionQuery.isLoading;
  const transaction = transactionQuery.data;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          title="Transaction"
          description="Milestone proof status and review actions."
        />

        {isLoading ? (
          <p className="mt-6 text-sm text-brand-muted">Loading...</p>
        ) : !transaction ? (
          <p className="mt-6 text-sm text-brand-muted">
            Transaction not found.
          </p>
        ) : (
          <>
            <Card className="mt-6 flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-brand-text">
                  Transaction {transaction.id.slice(0, 8)}
                </p>
                <p className="text-xs text-brand-muted">
                  {transaction.currency}
                </p>
              </div>
              <TransactionStatusBadge status={transaction.status} />
            </Card>

            <Card className="mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-brand-text">Escrow tracking</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  View provider-confirmed funding, release conditions and settlement status.
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md border border-brand-secondary/70 px-4 text-sm font-semibold text-brand-secondary transition hover:bg-brand-secondary/10"
                href={`/dashboard/transactions/${transaction.id}/escrow`}
              >
                Open escrow
              </Link>
            </Card>

            <Card className="mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-brand-text">Financing</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Apply for partner-reviewed rent or mortgage financing linked to this transaction.
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md border border-brand-secondary/70 px-4 text-sm font-semibold text-brand-secondary transition hover:bg-brand-secondary/10"
                href={`/dashboard/transactions/${transaction.id}/financing`}
              >
                Finance transaction
              </Link>
            </Card>

            {actionError ? (
              <div className="mt-4">
                <p className="text-sm text-red-500">{actionError}</p>
              </div>
            ) : null}

            <section className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-brand-text">
                Milestones
              </h2>
              <div className="grid gap-3">
                {transaction.milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isPending={pendingId === milestone.id}
                    pendingAction={pendingAction}
                    onSubmitProof={(file, note, amountClaimed, reference) =>
                      proofMutation.mutate({
                        milestoneId: milestone.id,
                        file,
                        note,
                        amountClaimed,
                        reference,
                      })
                    }
                    onAccept={() =>
                      milestoneActionMutation.mutate({
                        milestoneId: milestone.id,
                        action: "accept",
                      })
                    }
                    onReject={() =>
                      milestoneActionMutation.mutate({
                        milestoneId: milestone.id,
                        action: "reject",
                      })
                    }
                    onDispute={() =>
                      milestoneActionMutation.mutate({
                        milestoneId: milestone.id,
                        action: "dispute",
                      })
                    }
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}

function MilestoneCard({
  milestone,
  isPending,
  pendingAction,
  onSubmitProof,
  onAccept,
  onReject,
  onDispute,
}: {
  milestone: PaymentMilestone;
  isPending: boolean;
  pendingAction: string;
  onSubmitProof: (
    file: File,
    note: string,
    amountClaimed: string,
    reference: string
  ) => void;
  onAccept: () => void;
  onReject: () => void;
  onDispute: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [amountClaimed, setAmountClaimed] = useState("");
  const [reference, setReference] = useState("");

  const statusLabel: Record<PaymentMilestone["status"], string> = {
    pending: "No proof submitted yet",
    proof_uploaded: "Payment proof uploaded — Pending review",
    under_review: "Pending review",
    accepted: "Accepted by reviewer",
    rejected: "Rejected by reviewer",
    disputed: "Disputed",
    cancelled: "Cancelled",
  };

  const canReview =
    milestone.status === "proof_uploaded" || milestone.status === "under_review";
  const canSubmitProof =
    milestone.status === "pending" || milestone.status === "rejected";

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-brand-text">{milestone.title}</p>
          <p className="text-xs text-brand-muted">
            {milestone.amount} {milestone.currency}
          </p>
        </div>
        <MilestoneStatusBadge status={milestone.status} />
      </div>

      <p className="mt-2 text-xs text-brand-muted">
        {statusLabel[milestone.status]}
      </p>

      {canSubmitProof ? (
        <div className="mt-3 grid gap-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <input
            className="rounded-sm border px-2.5 py-1 text-xs"
            placeholder="Amount claimed"
            value={amountClaimed}
            onChange={(e) => setAmountClaimed(e.target.value)}
          />
          <input
            className="rounded-sm border px-2.5 py-1 text-xs"
            placeholder="Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <textarea
            className="rounded-sm border px-2.5 py-1 text-xs"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            disabled={!file || (isPending && pendingAction === "proof")}
            onClick={() => {
              if (file) onSubmitProof(file, note, amountClaimed, reference);
            }}
          >
            {isPending && pendingAction === "proof"
              ? "Uploading..."
              : "Submit payment proof"}
          </Button>
        </div>
      ) : null}

      {canReview ? (
        <div className="mt-3 flex gap-2">
          <Button
            disabled={isPending}
            onClick={onAccept}
          >
            {isPending && pendingAction === "accept" ? "Accepting..." : "Accept"}
          </Button>
          <Button
            disabled={isPending}
            onClick={onReject}
          >
            {isPending && pendingAction === "reject" ? "Rejecting..." : "Reject"}
          </Button>
          <Button
            disabled={isPending}
            onClick={onDispute}
          >
            {isPending && pendingAction === "dispute" ? "Disputing..." : "Dispute"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
