import type {
  Inquiry,
  InquiryPayload,
  InquiryStatus,
  InquiryUser,
  PaginatedInquiries,
} from "@/lib/api/inquiries";
import type { Property } from "@/lib/api/properties";
import { getMockSessionUser } from "@/mocks/mock-auth";
import { mockProperties } from "@/mocks/mock-properties";
import { findMockUserByEmail, findMockUserById, mockAgents, mockBuyers } from "@/mocks/mock-users";

const INQUIRIES_KEY = "realityng.mockInquiries";

function userSummary(userIdOrEmail: string): InquiryUser {
  const user =
    findMockUserById(userIdOrEmail) ??
    findMockUserByEmail(userIdOrEmail) ??
    mockBuyers[0] ??
    mockAgents[0];

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email,
    phone_number: user.phone_number,
  };
}

function propertySummary(property: Property) {
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    listing_type: property.listing_type,
    property_type: property.property_type,
    price: property.price,
    currency: property.currency,
    city: property.city,
    state: property.state,
    cover_image_url: property.cover_image_url,
  };
}

function ownerSummary(property: Property): InquiryUser {
  return userSummary(property.agent_id ?? mockAgents[0]?.id ?? "agent@realityng.com");
}

function seedInquiry({
  id,
  propertyIndex,
  buyerEmail,
  message,
  status,
  createdAt,
}: {
  id: string;
  propertyIndex: number;
  buyerEmail: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}): Inquiry {
  const property = mockProperties[propertyIndex] ?? mockProperties[0];
  return {
    id,
    property: propertySummary(property),
    interested_user: userSummary(buyerEmail),
    property_owner: ownerSummary(property),
    inquiry_type:
      property.listing_type === "sale"
        ? "purchase"
        : property.listing_type === "apartment_share"
          ? "apartment_share"
          : "rent",
    message,
    contact_preference: "whatsapp",
    status,
    internal_notes: "",
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export const mockInquiries: Inquiry[] = [
  seedInquiry({
    id: "inq-1",
    propertyIndex: 0,
    buyerEmail: "buyer@realityng.com",
    message: "I am interested in a virtual walkthrough and title documentation review.",
    status: "new",
    createdAt: "2026-06-23T08:30:00Z",
  }),
  seedInquiry({
    id: "inq-2",
    propertyIndex: 1,
    buyerEmail: "halima.buyer@realityng.com",
    message: "Can the viewing be scheduled for Friday afternoon with my spouse?",
    status: "viewing_scheduled",
    createdAt: "2026-06-22T14:20:00Z",
  }),
  seedInquiry({
    id: "inq-3",
    propertyIndex: 2,
    buyerEmail: "sade.buyer@realityng.com",
    message: "Please confirm service charge, power arrangement, and annual rent terms.",
    status: "contacted",
    createdAt: "2026-06-22T11:05:00Z",
  }),
  seedInquiry({
    id: "inq-4",
    propertyIndex: 3,
    buyerEmail: "tara.buyer@realityng.com",
    message: "I would like projected occupancy and management fee assumptions.",
    status: "negotiating",
    createdAt: "2026-06-21T16:45:00Z",
  }),
  seedInquiry({
    id: "inq-5",
    propertyIndex: 4,
    buyerEmail: "emeka.buyer@realityng.com",
    message: "Send the last twelve months of revenue and occupancy summaries.",
    status: "new",
    createdAt: "2026-06-21T10:10:00Z",
  }),
  seedInquiry({
    id: "inq-6",
    propertyIndex: 5,
    buyerEmail: "samuel.buyer@realityng.com",
    message: "Can the owner accept staged payment after due diligence?",
    status: "contacted",
    createdAt: "2026-06-20T13:35:00Z",
  }),
  seedInquiry({
    id: "inq-7",
    propertyIndex: 6,
    buyerEmail: "kingsley.buyer@realityng.com",
    message: "Please share the deed and survey coordinates before inspection.",
    status: "new",
    createdAt: "2026-06-20T09:15:00Z",
  }),
  seedInquiry({
    id: "inq-8",
    propertyIndex: 7,
    buyerEmail: "yewande.buyer@realityng.com",
    message: "I want to compare rental yield against Akobo and Bodija apartments.",
    status: "viewing_scheduled",
    createdAt: "2026-06-19T15:05:00Z",
  }),
  seedInquiry({
    id: "inq-9",
    propertyIndex: 8,
    buyerEmail: "david.buyer@realityng.com",
    message: "Our investment committee needs tenant schedule and lease terms.",
    status: "negotiating",
    createdAt: "2026-06-19T12:55:00Z",
  }),
  seedInquiry({
    id: "inq-10",
    propertyIndex: 9,
    buyerEmail: "halima.buyer@realityng.com",
    message: "Please confirm plot size, access road status, and title type.",
    status: "contacted",
    createdAt: "2026-06-18T17:20:00Z",
  }),
  seedInquiry({
    id: "inq-11",
    propertyIndex: 10,
    buyerEmail: "emeka.buyer@realityng.com",
    message: "I need a home inspection report and security details.",
    status: "converted",
    createdAt: "2026-06-18T09:50:00Z",
  }),
  seedInquiry({
    id: "inq-12",
    propertyIndex: 11,
    buyerEmail: "tara.buyer@realityng.com",
    message: "Please send furniture inventory and current booking performance.",
    status: "viewing_scheduled",
    createdAt: "2026-06-17T18:40:00Z",
  }),
  seedInquiry({
    id: "inq-13",
    propertyIndex: 12,
    buyerEmail: "obinna.buyer@realityng.com",
    message: "I am reviewing hospitality assets and would like the inspection pack.",
    status: "new",
    createdAt: "2026-06-17T14:00:00Z",
  }),
  seedInquiry({
    id: "inq-14",
    propertyIndex: 13,
    buyerEmail: "sade.buyer@realityng.com",
    message: "Can the landlord offer fit-out allowance for a three-year lease?",
    status: "negotiating",
    createdAt: "2026-06-16T13:10:00Z",
  }),
  seedInquiry({
    id: "inq-15",
    propertyIndex: 14,
    buyerEmail: "yewande.buyer@realityng.com",
    message: "We are ready to proceed if the verification checks are clean.",
    status: "converted",
    createdAt: "2026-06-15T10:25:00Z",
  }),
];

function readInquiries(): Inquiry[] {
  if (typeof window === "undefined") {
    return mockInquiries;
  }
  const stored = window.localStorage.getItem(INQUIRIES_KEY);
  if (!stored) {
    window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(mockInquiries));
    return mockInquiries;
  }
  return JSON.parse(stored) as Inquiry[];
}

function writeInquiries(inquiries: Inquiry[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  }
}

function paginate(results: Inquiry[]): PaginatedInquiries {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

export async function mockCreateInquiry(payload: InquiryPayload): Promise<Inquiry> {
  const property = mockProperties.find((item) => item.id === payload.property_id);
  const user = getMockSessionUser();
  if (!property || !user) {
    throw new Error("Property or user is not available.");
  }

  const now = new Date().toISOString();
  const inquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    property: propertySummary(property),
    interested_user: userSummary(user.id),
    property_owner: ownerSummary(property),
    inquiry_type: payload.inquiry_type,
    message: payload.message ?? "",
    contact_preference: payload.contact_preference,
    status: "new",
    internal_notes: "",
    created_at: now,
    updated_at: now,
  };
  const inquiries = [inquiry, ...readInquiries()];
  writeInquiries(inquiries);
  return inquiry;
}

export async function mockListMyInquiries(): Promise<PaginatedInquiries> {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(readInquiries().filter((inquiry) => inquiry.interested_user.id === user.id));
}

export async function mockListReceivedInquiries(): Promise<PaginatedInquiries> {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(readInquiries().filter((inquiry) => inquiry.property_owner.id === user.id));
}

export async function mockUpdateInquiryStatus({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}): Promise<Inquiry> {
  const inquiries = readInquiries();
  const inquiry = inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }
  inquiry.status = status;
  inquiry.updated_at = new Date().toISOString();
  writeInquiries(inquiries);
  return inquiry;
}

export async function mockUpdateInquiryNotes({
  inquiryId,
  internalNotes,
}: {
  inquiryId: string;
  internalNotes: string;
}): Promise<Inquiry> {
  const inquiries = readInquiries();
  const inquiry = inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }
  inquiry.internal_notes = internalNotes;
  inquiry.updated_at = new Date().toISOString();
  writeInquiries(inquiries);
  return inquiry;
}
