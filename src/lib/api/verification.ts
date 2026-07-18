import { apiClient } from "@/lib/api/client";
import type { VerificationStatus } from "@/components/verification/verification-status-badge";

export type VerificationType =
  | "agent"
  | "landlord"
  | "artisan"
  | "identity"
  | "property_ownership"
  | "property_listing";

export type VerificationRequestPayload = {
  verification_type: VerificationType;
  business_name: string;
  cac_registration_number: string;
  trade_category: string;
  years_experience: number;
  phone_number: string;
  contact_address: string;
  city: string;
};

export type VerificationRequest = VerificationRequestPayload & {
  id: string;
  status: VerificationStatus;
  submitted_at: string;
};

export async function createVerificationRequest(
  payload: VerificationRequestPayload
): Promise<VerificationRequest> {
  const response = await apiClient.post<VerificationRequest>(
    "/verifications/",
    { ...payload }
  );
  return response.data;
}

export type PaginatedVerificationRequests = {
  count: number;
  next: string | null;
  previous: string | null;
  results: VerificationRequest[];
};

export async function listVerificationRequests(
  page = 1
): Promise<PaginatedVerificationRequests> {
  const response = await apiClient.get<PaginatedVerificationRequests>(
    "/verifications/",
    { params: { page } }
  );
  return response.data;
}
