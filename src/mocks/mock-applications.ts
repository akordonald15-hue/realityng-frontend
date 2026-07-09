import type {
  PaginatedApplications,
  RentalApplication,
  RentalApplicationPayload,
  RentalApplicationStatus,
} from "@/lib/api/applications";
import { getMockSessionUser } from "@/mocks/mock-auth";
import { mockProperties } from "@/mocks/mock-properties";
import { findMockUserById, mockBuyers } from "@/mocks/mock-users";
import { mockViewings } from "@/mocks/mock-viewings";

const APPLICATIONS_KEY = "realityng.mockApplications";

function propertySummary(property: (typeof mockProperties)[number]) {
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

function userSummary(userId: string) {
  const user = findMockUserById(userId) ?? mockBuyers[0];
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone_number: user.phone_number,
  };
}

const now = new Date();
const isoDate = (days: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days).toISOString().slice(0, 10);

export const mockApplications: RentalApplication[] = mockViewings
  .slice(0, 4)
  .map((viewing, index) => {
    const property =
      mockProperties.find((item) => item.id === viewing.property.id) ?? mockProperties[index];
    const status: RentalApplicationStatus[] = ["submitted", "under_review", "approved", "rejected"];
    return {
      id: `application-${index + 1}`,
      property: propertySummary(property),
      applicant: viewing.requester,
      property_owner: viewing.property_owner,
      inquiry: viewing.inquiry,
      viewing: viewing.id,
      full_name: viewing.requester.full_name,
      email: viewing.requester.email,
      phone: viewing.requester.phone_number ?? "+234 800 000 0000",
      employment_status: index % 2 === 0 ? "Employed" : "Self-employed",
      employer_name: index % 2 === 0 ? "Diaspora Tech Holdings" : "Independent consultant",
      monthly_income: index % 2 === 0 ? "950000.00" : "720000.00",
      move_in_date: isoDate(index + 21),
      message: "I am ready to proceed after the RealityNG review.",
      status: status[index],
      owner_notes: index === 1 ? "Applicant has a strong profile and completed viewing." : "",
      created_at: viewing.created_at,
      updated_at: viewing.updated_at,
    };
  });

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readApplications(): RentalApplication[] {
  if (!canUseStorage()) {
    return mockApplications;
  }
  const stored = window.localStorage.getItem(APPLICATIONS_KEY);
  if (!stored) {
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(mockApplications));
    return mockApplications;
  }
  return JSON.parse(stored) as RentalApplication[];
}

function writeApplications(applications: RentalApplication[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  }
}

function paginate(results: RentalApplication[]): PaginatedApplications {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

function findApplication(applicationId: string) {
  const applications = readApplications();
  const application = applications.find((item) => item.id === applicationId);
  if (!application) {
    throw new Error("Application not found.");
  }
  return { application, applications };
}

function transitionApplication(
  applicationId: string,
  status: RentalApplicationStatus,
): RentalApplication {
  const { application, applications } = findApplication(applicationId);
  application.status = status;
  application.updated_at = new Date().toISOString();
  writeApplications(applications);
  return application;
}

export async function mockCreateApplication(
  payload: RentalApplicationPayload,
): Promise<RentalApplication> {
  const user = getMockSessionUser();
  const property = mockProperties.find((item) => item.id === payload.property_id);
  if (!user || !property || property.agent_id === user.id) {
    throw new Error("Property is not available for applications.");
  }
  const owner = property.agent_id ? userSummary(property.agent_id) : userSummary("agent-1");
  const nowIso = new Date().toISOString();
  const application: RentalApplication = {
    id: `application-${Date.now()}`,
    property: propertySummary(property),
    applicant: userSummary(user.id),
    property_owner: owner,
    inquiry: payload.inquiry_id ?? null,
    viewing: payload.viewing_id ?? null,
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    employment_status: payload.employment_status,
    employer_name: payload.employer_name ?? "",
    monthly_income: payload.monthly_income,
    move_in_date: payload.move_in_date,
    message: payload.message ?? "",
    status: "submitted",
    owner_notes: "",
    created_at: nowIso,
    updated_at: nowIso,
  };
  const applications = [application, ...readApplications()];
  writeApplications(applications);
  return application;
}

export async function mockListMyApplications(): Promise<PaginatedApplications> {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(readApplications().filter((application) => application.applicant.id === user.id));
}

export async function mockListReceivedApplications(): Promise<PaginatedApplications> {
  const user = getMockSessionUser();
  if (!user) {
    return paginate([]);
  }
  return paginate(
    readApplications().filter((application) => application.property_owner.id === user.id),
  );
}

export async function mockMarkApplicationUnderReview(
  applicationId: string,
): Promise<RentalApplication> {
  return transitionApplication(applicationId, "under_review");
}

export async function mockApproveApplication(applicationId: string): Promise<RentalApplication> {
  return transitionApplication(applicationId, "approved");
}

export async function mockRejectApplication(applicationId: string): Promise<RentalApplication> {
  return transitionApplication(applicationId, "rejected");
}

export async function mockWithdrawApplication(applicationId: string): Promise<RentalApplication> {
  return transitionApplication(applicationId, "withdrawn");
}

export async function mockUpdateApplicationNotes({
  applicationId,
  ownerNotes,
}: {
  applicationId: string;
  ownerNotes: string;
}): Promise<RentalApplication> {
  const { application, applications } = findApplication(applicationId);
  application.owner_notes = ownerNotes;
  application.updated_at = new Date().toISOString();
  writeApplications(applications);
  return application;
}
