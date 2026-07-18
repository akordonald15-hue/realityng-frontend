import { apiClient } from "@/lib/api/client";
import type { VerificationStatus } from "@/components/verification/verification-status-badge";

export type VerificationDocumentType =
  | "ownership_evidence"
  | "location_evidence"
  | "inspection_evidence";

export type VerificationDocument = {
  id: string;
  document_type: VerificationDocumentType;
  file: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
};

/**
 * Uploads a single evidence file against an existing property
 * verification request. The property verification must already exist
 * (create it first via createPropertyVerificationRequest) before
 * uploading evidence documents against it.
 */
export async function uploadPropertyVerificationDocument(
  propertyVerificationId: string,
  documentType: VerificationDocumentType,
  file: File
): Promise<VerificationDocument> {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", file);

  const response = await apiClient.post<VerificationDocument>(
    `/property-verifications/${propertyVerificationId}/documents/`,
    formData
  );
  return response.data;
}

export type PropertyVerificationPayload = {
  property: string;
  ownership_evidence?: string;
  location_evidence?: string;
  inspection_evidence?: string;
};

export type PropertyVerification = PropertyVerificationPayload & {
  id: string;
  status: VerificationStatus;
  submitted_at: string;
};

export async function createPropertyVerificationRequest(
  payload: PropertyVerificationPayload
): Promise<PropertyVerification> {
  const response = await apiClient.post<PropertyVerification>(
    "/property-verifications/",
    { ...payload }
  );
  return response.data;
}
