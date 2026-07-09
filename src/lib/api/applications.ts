import { apiClient } from "@/lib/api/client";
import type { InquiryPropertySummary, InquiryUser } from "@/lib/api/inquiries";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockApproveApplication,
  mockCreateApplication,
  mockListMyApplications,
  mockListReceivedApplications,
  mockMarkApplicationUnderReview,
  mockRejectApplication,
  mockUpdateApplicationNotes,
  mockWithdrawApplication,
} from "@/mocks/mock-applications";

export type RentalApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

export type RentalApplication = {
  id: string;
  property: InquiryPropertySummary;
  applicant: InquiryUser;
  property_owner: InquiryUser;
  inquiry: string | null;
  viewing: string | null;
  full_name: string;
  email: string;
  phone: string;
  employment_status: string;
  employer_name: string;
  monthly_income: string;
  move_in_date: string;
  message: string;
  status: RentalApplicationStatus;
  owner_notes: string;
  created_at: string;
  updated_at: string;
};

export type RentalApplicationPayload = {
  property_id: string;
  inquiry_id?: string | null;
  viewing_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  employment_status: string;
  employer_name?: string;
  monthly_income: string;
  move_in_date: string;
  message?: string;
};

export type PaginatedApplications = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RentalApplication[];
};

export const rentalApplicationStatusOptions: Array<{
  label: string;
  value: RentalApplicationStatus;
}> = [
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export function formatApplicationStatus(status: RentalApplicationStatus): string {
  return rentalApplicationStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export async function createApplication(
  payload: RentalApplicationPayload,
): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockCreateApplication(payload);
  }
  const response = await apiClient.post<RentalApplication>("/applications/", payload);
  return response.data;
}

export async function listMyApplications(): Promise<PaginatedApplications> {
  if (USE_MOCKS) {
    return mockListMyApplications();
  }
  const response = await apiClient.get<PaginatedApplications>("/applications/");
  return response.data;
}

export async function listReceivedApplications(): Promise<PaginatedApplications> {
  if (USE_MOCKS) {
    return mockListReceivedApplications();
  }
  const response = await apiClient.get<PaginatedApplications>("/applications/received/");
  return response.data;
}

export async function markApplicationUnderReview(
  applicationId: string,
): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockMarkApplicationUnderReview(applicationId);
  }
  const response = await apiClient.post<RentalApplication>(
    `/applications/${applicationId}/under-review/`,
    {},
  );
  return response.data;
}

export async function approveApplication(applicationId: string): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockApproveApplication(applicationId);
  }
  const response = await apiClient.post<RentalApplication>(
    `/applications/${applicationId}/approve/`,
    {},
  );
  return response.data;
}

export async function rejectApplication(applicationId: string): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockRejectApplication(applicationId);
  }
  const response = await apiClient.post<RentalApplication>(
    `/applications/${applicationId}/reject/`,
    {},
  );
  return response.data;
}

export async function withdrawApplication(applicationId: string): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockWithdrawApplication(applicationId);
  }
  const response = await apiClient.post<RentalApplication>(
    `/applications/${applicationId}/withdraw/`,
    {},
  );
  return response.data;
}

export async function updateApplicationNotes({
  applicationId,
  ownerNotes,
}: {
  applicationId: string;
  ownerNotes: string;
}): Promise<RentalApplication> {
  if (USE_MOCKS) {
    return mockUpdateApplicationNotes({ applicationId, ownerNotes });
  }
  const response = await apiClient.patch<RentalApplication>(
    `/applications/${applicationId}/notes/`,
    { owner_notes: ownerNotes },
  );
  return response.data;
}
