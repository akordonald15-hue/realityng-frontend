import { apiClient } from "@/lib/api/client";
import type {
  VerificationRequest,
  PaginatedVerificationRequests,
} from "@/lib/api/verification";
import type {
  PropertyVerification,
  PaginatedPropertyVerifications,
} from "@/lib/api/property-verification";

export type AdminVerificationAction =
  | "approve"
  | "reject"
  | "request-info"
  | "suspend"
  | "expire";

export type AdminActionPayload = {
  reason?: string;
  note?: string;
};

export async function listAdminVerificationRequests(
  page = 1,
): Promise<PaginatedVerificationRequests> {
  const response = await apiClient.get<PaginatedVerificationRequests>(
    "/admin/verifications/",
    { params: { page } },
  );
  return response.data;
}

export async function getAdminVerificationRequest(
  id: string,
): Promise<VerificationRequest> {
  const response = await apiClient.get<VerificationRequest>(
    `/admin/verifications/${id}/`,
  );
  return response.data;
}

export async function performVerificationAction(
  id: string,
  action: AdminVerificationAction,
  payload: AdminActionPayload = {},
): Promise<VerificationRequest> {
  const response = await apiClient.post<VerificationRequest>(
    `/admin/verifications/${id}/${action}/`,
    payload,
  );
  return response.data;
}

export async function listAdminPropertyVerifications(
  page = 1,
): Promise<PaginatedPropertyVerifications> {
  const response = await apiClient.get<PaginatedPropertyVerifications>(
    "/admin/property-verifications/",
    { params: { page } },
  );
  return response.data;
}

export async function getAdminPropertyVerification(
  id: string,
): Promise<PropertyVerification> {
  const response = await apiClient.get<PropertyVerification>(
    `/admin/property-verifications/${id}/`,
  );
  return response.data;
}

export async function performPropertyVerificationAction(
  id: string,
  action: AdminVerificationAction,
  payload: AdminActionPayload = {},
): Promise<PropertyVerification> {
  const response = await apiClient.post<PropertyVerification>(
    `/admin/property-verifications/${id}/${action}/`,
    payload,
  );
  return response.data;
}
