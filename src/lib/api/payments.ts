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
