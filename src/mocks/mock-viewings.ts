import type { Viewing, ViewingDecisionPayload, ViewingPayload } from "@/lib/api/viewings";
import { getMockSessionUser } from "@/mocks/mock-auth";
import { mockInquiries, mockReadInquiries, mockUpdateInquiryStatus } from "@/mocks/mock-inquiries";

const VIEWINGS_KEY = "realityng.mockViewings";

const now = new Date();
const isoDate = (days: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days).toISOString().slice(0, 10);

export const mockViewings: Viewing[] = mockInquiries.slice(0, 5).map((inquiry, index) => ({
  id: `viewing-${index + 1}`,
  inquiry: inquiry.id,
  property: inquiry.property,
  requester: inquiry.interested_user,
  property_owner: inquiry.property_owner,
  viewing_type: index % 2 === 0 ? "physical" : "virtual",
  preferred_date: isoDate(index + 3),
  preferred_time: index % 2 === 0 ? "11:00:00" : "15:30:00",
  confirmed_datetime:
    index < 2 ? new Date(Date.now() + (index + 4) * 86400000).toISOString() : null,
  meeting_location: index % 2 === 0 ? "Property reception" : "",
  meeting_link: index % 2 === 0 ? "" : "https://meet.example.com/realityng-demo",
  notes: index === 0 ? "Please confirm access with estate security." : "",
  status: index === 0 ? "confirmed" : index === 1 ? "rescheduled" : "requested",
  created_at: inquiry.created_at,
  updated_at: inquiry.updated_at,
}));

function readViewings(): Viewing[] {
  if (typeof window === "undefined") {
    return mockViewings;
  }
  const stored = window.localStorage.getItem(VIEWINGS_KEY);
  if (!stored) {
    window.localStorage.setItem(VIEWINGS_KEY, JSON.stringify(mockViewings));
    return mockViewings;
  }
  return JSON.parse(stored) as Viewing[];
}

function writeViewings(viewings: Viewing[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VIEWINGS_KEY, JSON.stringify(viewings));
  }
}

function paginate(results: Viewing[]) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

function findViewing(viewingId: string) {
  const viewings = readViewings();
  const viewing = viewings.find((item) => item.id === viewingId);
  if (!viewing) {
    throw new Error("Viewing not found.");
  }
  return { viewing, viewings };
}

function applyDecision(payload: ViewingDecisionPayload, status: Viewing["status"]): Viewing {
  const { viewing, viewings } = findViewing(payload.viewingId);
  viewing.status = status;
  viewing.confirmed_datetime = payload.confirmed_datetime;
  viewing.meeting_location = payload.meeting_location ?? viewing.meeting_location;
  viewing.meeting_link = payload.meeting_link ?? viewing.meeting_link;
  viewing.notes = payload.notes ?? viewing.notes;
  viewing.updated_at = new Date().toISOString();
  writeViewings(viewings);
  void mockUpdateInquiryStatus({ inquiryId: viewing.inquiry, status: "viewing_scheduled" });
  return viewing;
}

export async function mockCreateViewing(payload: ViewingPayload): Promise<Viewing> {
  const user = getMockSessionUser();
  const inquiry = mockReadInquiries().find((item) => item.id === payload.inquiry_id);
  if (!user || !inquiry || inquiry.interested_user.id !== user.id) {
    throw new Error("Inquiry is not available for viewing requests.");
  }

  const nowIso = new Date().toISOString();
  const viewing: Viewing = {
    id: `viewing-${Date.now()}`,
    inquiry: inquiry.id,
    property: inquiry.property,
    requester: inquiry.interested_user,
    property_owner: inquiry.property_owner,
    viewing_type: payload.viewing_type,
    preferred_date: payload.preferred_date,
    preferred_time: payload.preferred_time,
    confirmed_datetime: null,
    meeting_location: "",
    meeting_link: "",
    notes: payload.notes ?? "",
    status: "requested",
    created_at: nowIso,
    updated_at: nowIso,
  };
  const viewings = [viewing, ...readViewings()];
  writeViewings(viewings);
  return viewing;
}

export async function mockListMyViewings() {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(readViewings().filter((viewing) => viewing.requester.id === user.id));
}

export async function mockListReceivedViewings() {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(readViewings().filter((viewing) => viewing.property_owner.id === user.id));
}

export async function mockConfirmViewing(payload: ViewingDecisionPayload): Promise<Viewing> {
  return applyDecision(payload, "confirmed");
}

export async function mockRescheduleViewing(payload: ViewingDecisionPayload): Promise<Viewing> {
  return applyDecision(payload, "rescheduled");
}

export async function mockCancelViewing({
  viewingId,
  notes = "",
}: {
  viewingId: string;
  notes?: string;
}): Promise<Viewing> {
  const { viewing, viewings } = findViewing(viewingId);
  viewing.status = "cancelled";
  viewing.notes = notes || viewing.notes;
  viewing.updated_at = new Date().toISOString();
  writeViewings(viewings);
  return viewing;
}

export async function mockCompleteViewing(viewingId: string): Promise<Viewing> {
  const { viewing, viewings } = findViewing(viewingId);
  viewing.status = "completed";
  viewing.updated_at = new Date().toISOString();
  writeViewings(viewings);
  return viewing;
}

export async function mockUpdateViewingNotes({
  viewingId,
  notes,
}: {
  viewingId: string;
  notes: string;
}): Promise<Viewing> {
  const { viewing, viewings } = findViewing(viewingId);
  viewing.notes = notes;
  viewing.updated_at = new Date().toISOString();
  writeViewings(viewings);
  return viewing;
}
