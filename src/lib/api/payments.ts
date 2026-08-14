import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export type TransactionStatus = "draft" | "active" | "completed" | "cancelled" | "disputed";
export type MilestoneStatus =
  | "pending"
  | "proof_uploaded"
  | "under_review"
  | "accepted"
  | "rejected"
  | "disputed"
  | "cancelled";
export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";
export type EscrowStatus =
  | "draft"
  | "awaiting_provider"
  | "awaiting_funding"
  | "partially_funded"
  | "funded"
  | "conditions_pending"
  | "release_pending"
  | "released"
  | "refund_pending"
  | "refunded"
  | "disputed"
  | "cancelled"
  | "failed";
export type EscrowFundingStatus =
  | "funding_expected"
  | "funding_claimed"
  | "partially_confirmed"
  | "confirmed_by_provider"
  | "reversed";
export type EscrowReleaseStatus =
  | "not_requested"
  | "requested"
  | "approved"
  | "sent_to_provider"
  | "confirmed"
  | "failed"
  | "cancelled";
export type EscrowRefundStatus = EscrowReleaseStatus;
export type EscrowConditionStatus = "pending" | "satisfied" | "failed" | "waived";

export type PaymentProof = {
  id: string;
  milestone: string;
  uploaded_by: string;
  original_filename: string;
  file_size: number;
  checksum: string;
  amount_claimed: string;
  reference: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type PaymentMilestone = {
  id: string;
  transaction: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  due_date: string | null;
  order: number;
  status: MilestoneStatus;
  proofs: PaymentProof[];
  created_at: string;
  updated_at: string;
};

export type PaymentDispute = {
  id: string;
  transaction: string;
  milestone: string | null;
  opened_by: string;
  reason: string;
  status: DisputeStatus;
  resolution_note: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  property: string;
  buyer: string;
  owner: string;
  application: string | null;
  status: TransactionStatus;
  currency: string;
  notes: string;
  milestones: PaymentMilestone[];
  disputes: PaymentDispute[];
  created_at: string;
  updated_at: string;
};

export type EscrowProvider = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "sandbox" | "active" | "disabled";
  integration_mode: "manual" | "sandbox" | "api";
  supports_partial_funding: boolean;
  supports_partial_release: boolean;
  supports_refunds: boolean;
  supports_webhooks: boolean;
  supports_reconciliation: boolean;
  supported_currencies: string[];
  created_at: string;
  updated_at: string;
};

export type EscrowFundingEvent = {
  id: string;
  escrow: string;
  provider_event_id: string;
  provider_reference: string;
  amount: string;
  currency: string;
  event_type: string;
  provider_status: string;
  occurred_at: string;
  recorded_by: string | null;
  raw_reference: string;
  is_reconciled: boolean;
  created_at: string;
  updated_at: string;
};

export type EscrowCondition = {
  id: string;
  escrow: string;
  condition_type: string;
  status: EscrowConditionStatus;
  description: string;
  required: boolean;
  inspection_request: string | null;
  construction_milestone: string | null;
  satisfied_at: string | null;
  satisfied_by: string | null;
  failed_at: string | null;
  failure_reason: string;
  created_at: string;
  updated_at: string;
};

export type EscrowRelease = {
  id: string;
  escrow: string;
  amount: string;
  currency: string;
  status: EscrowReleaseStatus;
  requested_by: string;
  approved_by: string | null;
  provider_instruction_id: string;
  provider_reference: string;
  idempotency_key: string;
  reason: string;
  approved_at: string | null;
  instructed_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EscrowRefund = Omit<EscrowRelease, "status"> & {
  status: EscrowRefundStatus;
};

export type EscrowSettlement = {
  id: string;
  escrow: string;
  provider_settlement_reference: string;
  gross_amount: string;
  seller_amount: string;
  platform_fee_amount: string;
  provider_fee_amount: string;
  currency: string;
  status: string;
  settled_at: string;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EscrowReconciliationRecord = {
  id: string;
  escrow: string;
  status: "matched" | "mismatch" | "pending_review" | "resolved";
  expected_amount: string;
  provider_amount: string;
  expected_status: string;
  provider_status: string;
  mismatch_details: string;
  checked_at: string;
  created_at: string;
  updated_at: string;
};

export type EscrowTransaction = {
  id: string;
  transaction: string;
  provider: EscrowProvider;
  external_reference: string;
  currency: string;
  expected_amount: string;
  confirmed_funded_amount: string;
  status: EscrowStatus;
  funding_status: EscrowFundingStatus;
  release_status: EscrowReleaseStatus;
  refund_status: EscrowRefundStatus;
  reconciliation_status: "not_checked" | "matched" | "mismatch" | "pending_review" | "resolved";
  platform_fee_type: "none" | "percentage" | "fixed" | "hybrid";
  platform_fee_value: string;
  expected_platform_fee: string;
  provider_fee: string;
  fee_status: "not_applicable" | "calculated" | "expected" | "instructed" | "settled";
  created_by: string;
  funded_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  closed_at: string | null;
  funding_events: EscrowFundingEvent[];
  conditions: EscrowCondition[];
  releases: EscrowRelease[];
  refunds: EscrowRefund[];
  settlements: EscrowSettlement[];
  reconciliation_records: EscrowReconciliationRecord[];
  created_at: string;
  updated_at: string;
};

export type EscrowReleasePayload = {
  amount?: string;
  reason?: string;
  idempotency_key?: string;
};

export type EscrowRefundPayload = {
  amount?: string;
  reason: string;
  idempotency_key?: string;
};

export type TransactionPayload = {
  property_id: string;
  application_id?: string | null;
  currency?: string;
  notes?: string;
};

export type MilestonePayload = {
  title: string;
  description?: string;
  amount: string;
  currency?: string;
  due_date?: string | null;
  order?: number;
};

export type PaymentProofPayload = {
  file: File;
  amount_claimed: string;
  reference?: string;
  note?: string;
};

export type DisputeCreatePayload = {
  reason: string;
  milestone?: string | null;
};

export type DisputeResolvePayload = {
  status: "resolved" | "closed";
  resolution_note?: string;
};

export async function listTransactions(): Promise<Transaction[]> {
  if (USE_MOCKS) return [];
  const response = await apiClient.get<Transaction[] | PaginatedResponse<Transaction>>(
    "/transactions/",
  );
  return unwrapList(response.data);
}

export async function getTransaction(transactionId: string): Promise<Transaction> {
  const response = await apiClient.get<Transaction>(`/transactions/${transactionId}/`);
  return response.data;
}

export async function getTransactionEscrow(transactionId: string): Promise<EscrowTransaction> {
  const response = await apiClient.get<EscrowTransaction>(
    `/transactions/${transactionId}/escrow/`,
  );
  return response.data;
}

export async function listEscrows(): Promise<EscrowTransaction[]> {
  if (USE_MOCKS) return [];
  const response = await apiClient.get<EscrowTransaction[] | PaginatedResponse<EscrowTransaction>>(
    "/payment-escrows/",
  );
  return unwrapList(response.data);
}

export async function requestEscrowRelease({
  escrowId,
  payload,
}: {
  escrowId: string;
  payload: EscrowReleasePayload;
}): Promise<EscrowRelease> {
  const response = await apiClient.post<EscrowRelease>(
    `/payment-escrows/${escrowId}/request-release/`,
    payload,
  );
  return response.data;
}

export async function requestEscrowRefund({
  escrowId,
  payload,
}: {
  escrowId: string;
  payload: EscrowRefundPayload;
}): Promise<EscrowRefund> {
  const response = await apiClient.post<EscrowRefund>(
    `/payment-escrows/${escrowId}/request-refund/`,
    payload,
  );
  return response.data;
}

export async function approveEscrowRelease({
  escrowId,
  releaseId,
}: {
  escrowId: string;
  releaseId: string;
}): Promise<EscrowRelease> {
  const response = await apiClient.post<EscrowRelease>(
    `/payment-escrows/${escrowId}/approve-release/`,
    { release_id: releaseId },
  );
  return response.data;
}

export async function confirmEscrowRelease({
  escrowId,
  releaseId,
  providerReference,
}: {
  escrowId: string;
  releaseId: string;
  providerReference: string;
}): Promise<EscrowRelease> {
  const response = await apiClient.post<EscrowRelease>(
    `/payment-escrows/${escrowId}/confirm-release/`,
    { release_id: releaseId, provider_reference: providerReference },
  );
  return response.data;
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const response = await apiClient.post<Transaction>("/transactions/", payload);
  return response.data;
}

export async function activateTransaction(transactionId: string): Promise<Transaction> {
  const response = await apiClient.post<Transaction>(`/transactions/${transactionId}/activate/`);
  return response.data;
}

export async function completeTransaction(transactionId: string): Promise<Transaction> {
  const response = await apiClient.post<Transaction>(`/transactions/${transactionId}/complete/`);
  return response.data;
}

export async function cancelTransaction(
  transactionId: string,
  reason?: string,
): Promise<Transaction> {
  const response = await apiClient.post<Transaction>(`/transactions/${transactionId}/cancel/`, {
    reason: reason ?? "",
  });
  return response.data;
}

export async function createMilestone({
  transactionId,
  payload,
}: {
  transactionId: string;
  payload: MilestonePayload;
}): Promise<PaymentMilestone> {
  const response = await apiClient.post<PaymentMilestone>(
    `/transactions/${transactionId}/milestones/`,
    payload,
  );
  return response.data;
}

export async function getMilestone(milestoneId: string): Promise<PaymentMilestone> {
  const response = await apiClient.get<PaymentMilestone>(`/payment-milestones/${milestoneId}/`);
  return response.data;
}

export async function submitPaymentProof({
  milestoneId,
  payload,
}: {
  milestoneId: string;
  payload: PaymentProofPayload;
}): Promise<PaymentProof> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("amount_claimed", payload.amount_claimed);
  if (payload.reference) formData.append("reference", payload.reference);
  if (payload.note) formData.append("note", payload.note);

  const response = await apiClient.post<PaymentProof>(
    `/payment-milestones/${milestoneId}/proofs/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

export async function startMilestoneReview(milestoneId: string): Promise<PaymentMilestone> {
  const response = await apiClient.post<PaymentMilestone>(
    `/payment-milestones/${milestoneId}/start-review/`,
  );
  return response.data;
}

export async function acceptMilestone(
  milestoneId: string,
  note?: string,
): Promise<PaymentMilestone> {
  const response = await apiClient.post<PaymentMilestone>(
    `/payment-milestones/${milestoneId}/accept/`,
    { note: note ?? "" },
  );
  return response.data;
}

export async function rejectMilestone(
  milestoneId: string,
  note?: string,
): Promise<PaymentMilestone> {
  const response = await apiClient.post<PaymentMilestone>(
    `/payment-milestones/${milestoneId}/reject/`,
    { note: note ?? "" },
  );
  return response.data;
}

export async function disputeMilestone(
  milestoneId: string,
  reason: string,
): Promise<PaymentDispute> {
  const response = await apiClient.post<PaymentDispute>(
    `/payment-milestones/${milestoneId}/dispute/`,
    { reason },
  );
  return response.data;
}

export async function disputeTransaction(
  transactionId: string,
  payload: DisputeCreatePayload,
): Promise<PaymentDispute> {
  const response = await apiClient.post<PaymentDispute>(
    `/transactions/${transactionId}/dispute/`,
    payload,
  );
  return response.data;
}

export async function getPaymentProofSignedUrl(proofId: string): Promise<string> {
  const response = await apiClient.get<{ url: string }>(`/payment-proofs/${proofId}/signed-url/`);
  return response.data.url;
}

export async function listDisputes(): Promise<PaymentDispute[]> {
  if (USE_MOCKS) return [];
  const response = await apiClient.get<PaymentDispute[] | PaginatedResponse<PaymentDispute>>(
    "/payment-disputes/",
  );
  return unwrapList(response.data);
}

export async function resolveDispute({
  disputeId,
  payload,
}: {
  disputeId: string;
  payload: DisputeResolvePayload;
}): Promise<PaymentDispute> {
  const response = await apiClient.post<PaymentDispute>(
    `/payment-disputes/${disputeId}/resolve/`,
    payload,
  );
  return response.data;
}
