import { apiClient } from "@/lib/api/client";
import type { ListingType, PropertyType } from "@/lib/api/properties";
import { USE_MOCKS } from "@/lib/demo-mode";
import {
  mockCreateInquiry,
  mockListMyInquiries,
  mockListReceivedInquiries,
  mockUpdateInquiryNotes,
  mockUpdateInquiryStatus,
} from "@/mocks/mock-inquiries";

export type InquiryType = "rent" | "purchase" | "apartment_share";
export type ContactPreference = "email" | "phone" | "whatsapp";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "viewing_scheduled"
  | "negotiating"
  | "converted"
  | "closed";

export type InquiryUser = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
};

export type InquiryPropertySummary = {
  id: string;
  title: string;
  slug: string;
  listing_type: ListingType;
  property_type: PropertyType;
  price: string;
  currency: string;
  city: string;
  state: string;
  cover_image_url?: string;
};

export type Inquiry = {
  id: string;
  property: InquiryPropertySummary;
  interested_user: InquiryUser;
  property_owner: InquiryUser;
  inquiry_type: InquiryType;
  message: string;
  contact_preference: ContactPreference;
  status: InquiryStatus;
  internal_notes: string;
  created_at: string;
  updated_at: string;
};

export type InquiryPayload = {
  property_id: string;
  inquiry_type: InquiryType;
  message?: string;
  contact_preference: ContactPreference;
};

export type PaginatedInquiries = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Inquiry[];
};

export const inquiryTypeOptions: Array<{ label: string; value: InquiryType }> = [
  { label: "Rent", value: "rent" },
  { label: "Purchase", value: "purchase" },
  { label: "Apartment Share", value: "apartment_share" },
];

export const contactPreferenceOptions: Array<{ label: string; value: ContactPreference }> = [
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
];

export const inquiryStatusOptions: Array<{ label: string; value: InquiryStatus }> = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Viewing Scheduled", value: "viewing_scheduled" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Converted", value: "converted" },
  { label: "Closed", value: "closed" },
];

export function inquiryTypeForListing(listingType: ListingType): InquiryType {
  if (listingType === "sale") {
    return "purchase";
  }
  if (listingType === "apartment_share") {
    return "apartment_share";
  }
  return "rent";
}

export function formatInquiryStatus(status: InquiryStatus): string {
  return inquiryStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export async function createInquiry(payload: InquiryPayload): Promise<Inquiry> {
  if (USE_MOCKS) {
    return mockCreateInquiry(payload);
  }
  const response = await apiClient.post<Inquiry>("/inquiries/", payload);
  return response.data;
}

export async function listMyInquiries(): Promise<PaginatedInquiries> {
  if (USE_MOCKS) {
    return mockListMyInquiries();
  }
  const response = await apiClient.get<PaginatedInquiries>("/inquiries/");
  return response.data;
}

export async function listReceivedInquiries(): Promise<PaginatedInquiries> {
  if (USE_MOCKS) {
    return mockListReceivedInquiries();
  }
  const response = await apiClient.get<PaginatedInquiries>("/inquiries/received/");
  return response.data;
}

export async function updateInquiryStatus({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}): Promise<Inquiry> {
  if (USE_MOCKS) {
    return mockUpdateInquiryStatus({ inquiryId, status });
  }
  const response = await apiClient.post<Inquiry>(`/inquiries/${inquiryId}/status/`, { status });
  return response.data;
}

export async function updateInquiryNotes({
  inquiryId,
  internalNotes,
}: {
  inquiryId: string;
  internalNotes: string;
}): Promise<Inquiry> {
  if (USE_MOCKS) {
    return mockUpdateInquiryNotes({ inquiryId, internalNotes });
  }
  const response = await apiClient.patch<Inquiry>(`/inquiries/${inquiryId}/notes/`, {
    internal_notes: internalNotes,
  });
  return response.data;
}
