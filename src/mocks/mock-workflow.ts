import type { ActivityItem, TransactionItem } from "@/lib/api/workflow";
import { getMockSessionUser } from "@/mocks/mock-auth";
import { mockApplications } from "@/mocks/mock-applications";
import { mockInquiries } from "@/mocks/mock-inquiries";
import { mockViewings } from "@/mocks/mock-viewings";

function stageFor(inquiryId: string): TransactionItem | null {
  const inquiry = mockInquiries.find((item) => item.id === inquiryId);
  if (!inquiry) {
    return null;
  }
  const viewing = mockViewings
    .filter((item) => item.inquiry === inquiry.id)
    .sort((first, second) => second.updated_at.localeCompare(first.updated_at))[0];
  const application = mockApplications
    .filter((item) => item.inquiry === inquiry.id || item.viewing === viewing?.id)
    .sort((first, second) => second.updated_at.localeCompare(first.updated_at))[0];

  if (application) {
    const labels: Record<string, string> = {
      submitted: "Application Submitted",
      under_review: "Application Under Review",
      approved: "Application Approved",
      rejected: "Application Rejected",
      withdrawn: "Application Withdrawn",
    };
    const actions: Record<string, string> = {
      submitted: "Await owner review",
      under_review: "Await owner decision",
      approved: "Prepare verification and lease steps",
      rejected: "Review other properties",
      withdrawn: "Apply again when ready",
    };
    return {
      property: application.property,
      stage: application.status,
      stage_label: labels[application.status],
      last_update: application.updated_at,
      next_action: actions[application.status],
      inquiry_id: inquiry.id,
      viewing_id: viewing?.id ?? null,
      application_id: application.id,
    };
  }

  if (viewing) {
    const labels: Record<string, string> = {
      requested: "Viewing Requested",
      rescheduled: "Viewing Rescheduled",
      confirmed: "Viewing Confirmed",
      completed: "Viewing Completed",
      cancelled: "Viewing Cancelled",
    };
    const actions: Record<string, string> = {
      requested: "Await owner confirmation",
      rescheduled: "Confirm new viewing plan",
      confirmed: "Attend viewing",
      completed: "Apply for property",
      cancelled: "Request another viewing",
    };
    return {
      property: viewing.property,
      stage: viewing.status,
      stage_label: labels[viewing.status],
      last_update: viewing.updated_at,
      next_action: actions[viewing.status],
      inquiry_id: inquiry.id,
      viewing_id: viewing.id,
      application_id: null,
    };
  }

  return {
    property: inquiry.property,
    stage: inquiry.status,
    stage_label: inquiry.status === "new" ? "Inquiry Submitted" : inquiry.status,
    last_update: inquiry.updated_at,
    next_action: inquiry.status === "closed" ? "Browse other properties" : "Request viewing",
    inquiry_id: inquiry.id,
    viewing_id: null,
    application_id: null,
  };
}

export async function mockGetTransactionCenter(): Promise<TransactionItem[]> {
  const user = getMockSessionUser();
  const role = user?.roles[0]?.role.name ?? "buyer";
  const relevant = mockInquiries.filter((inquiry) => {
    if (!user) {
      return false;
    }
    if (role === "agent" || role === "admin" || role === "super_admin") {
      return inquiry.property_owner.id === user.id || role.includes("admin");
    }
    return inquiry.interested_user.id === user.id;
  });
  return relevant.map((inquiry) => stageFor(inquiry.id)).filter(Boolean) as TransactionItem[];
}

export async function mockGetActivityFeed(): Promise<ActivityItem[]> {
  const transactions = await mockGetTransactionCenter();
  return transactions.slice(0, 8).map((transaction, index) => ({
    id: `activity-${index + 1}`,
    action: transaction.stage,
    label: transaction.stage_label,
    entity_type: transaction.application_id ? "RentalApplication" : "Workflow",
    entity_id: transaction.application_id ?? transaction.viewing_id ?? transaction.inquiry_id ?? "",
    property_id: transaction.property.id,
    occurred_at: transaction.last_update,
  }));
}
