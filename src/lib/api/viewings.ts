import { apiClient } from "@/lib/api/client";
import type { InquiryPropertySummary, InquiryUser } from "@/lib/api/inquiries";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockCancelViewing,
  mockCompleteViewing,
  mockConfirmViewing,
  mockCreateViewing,
  mockListMyViewings,
  mockListReceivedViewings,
  mockRescheduleViewing,
  mockUpdateViewingNotes,
} from "@/mocks/mock-viewings";

export type ViewingType = "physical" | "virtual";
export type ViewingStatus = "requested" | "rescheduled" | "confirmed" | "completed" | "cancelled";

export type Viewing = {
  id: string;
  inquiry: string;
  property: InquiryPropertySummary;
  requester: InquiryUser;
  property_owner: InquiryUser;
  viewing_type: ViewingType;
  preferred_date: string;
  preferred_time: string;
  confirmed_datetime: string | null;
  meeting_location: string;
  meeting_link: string;
  notes: string;
  status: ViewingStatus;
  created_at: string;
  updated_at: string;
};

export type ViewingPayload = {
  inquiry_id: string;
  viewing_type: ViewingType;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
};

export type ViewingDecisionPayload = {
  viewingId: string;
  confirmed_datetime: string;
  meeting_location?: string;
  meeting_link?: string;
  notes?: string;
};

export type PaginatedViewings = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Viewing[];
};

export const viewingTypeOptions: Array<{ label: string; value: ViewingType }> = [
  { label: "Physical", value: "physical" },
  { label: "Virtual", value: "virtual" },
];

export const viewingStatusOptions: Array<{ label: string; value: ViewingStatus }> = [
  { label: "Requested", value: "requested" },
  { label: "Rescheduled", value: "rescheduled" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function formatViewingStatus(status: ViewingStatus): string {
  return viewingStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function formatViewingType(type: ViewingType): string {
  return viewingTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export async function createViewing(payload: ViewingPayload): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockCreateViewing(payload);
  }
  const response = await apiClient.post<Viewing>("/viewings/", payload);
  return response.data;
}

export async function listMyViewings(): Promise<PaginatedViewings> {
  if (USE_MOCKS) {
    return mockListMyViewings();
  }
  const response = await apiClient.get<PaginatedViewings>("/viewings/");
  return response.data;
}

export async function listReceivedViewings(): Promise<PaginatedViewings> {
  if (USE_MOCKS) {
    return mockListReceivedViewings();
  }
  const response = await apiClient.get<PaginatedViewings>("/viewings/received/");
  return response.data;
}

export async function confirmViewing(payload: ViewingDecisionPayload): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockConfirmViewing(payload);
  }
  const { viewingId, ...body } = payload;
  const response = await apiClient.post<Viewing>(`/viewings/${viewingId}/confirm/`, body);
  return response.data;
}

export async function rescheduleViewing(payload: ViewingDecisionPayload): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockRescheduleViewing(payload);
  }
  const { viewingId, ...body } = payload;
  const response = await apiClient.post<Viewing>(`/viewings/${viewingId}/reschedule/`, body);
  return response.data;
}

export async function cancelViewing({
  viewingId,
  notes = "",
}: {
  viewingId: string;
  notes?: string;
}): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockCancelViewing({ viewingId, notes });
  }
  const response = await apiClient.post<Viewing>(`/viewings/${viewingId}/cancel/`, { notes });
  return response.data;
}

export async function completeViewing(viewingId: string): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockCompleteViewing(viewingId);
  }
  const response = await apiClient.post<Viewing>(`/viewings/${viewingId}/complete/`, {});
  return response.data;
}

export async function updateViewingNotes({
  viewingId,
  notes,
}: {
  viewingId: string;
  notes: string;
}): Promise<Viewing> {
  if (USE_MOCKS) {
    return mockUpdateViewingNotes({ viewingId, notes });
  }
  const response = await apiClient.patch<Viewing>(`/viewings/${viewingId}/notes/`, { notes });
  return response.data;
}
