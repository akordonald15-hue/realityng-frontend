import { apiClient } from "@/lib/api/client";
import type { InquiryPropertySummary } from "@/lib/api/inquiries";
import { USE_MOCKS } from "@/lib/demo-mode";
import { mockGetActivityFeed, mockGetTransactionCenter } from "@/mocks/mock-workflow";

export type TransactionItem = {
  property: InquiryPropertySummary;
  stage: string;
  stage_label: string;
  last_update: string;
  next_action: string;
  inquiry_id: string | null;
  viewing_id: string | null;
  application_id: string | null;
};

export type ActivityItem = {
  id: string;
  action: string;
  label: string;
  entity_type: string;
  entity_id: string;
  property_id: string;
  occurred_at: string;
};

export async function getTransactionCenter(): Promise<TransactionItem[]> {
  if (USE_MOCKS) {
    return mockGetTransactionCenter();
  }
  const response = await apiClient.get<TransactionItem[]>("/dashboard/transactions/");
  return response.data;
}

export async function getActivityFeed(): Promise<ActivityItem[]> {
  if (USE_MOCKS) {
    return mockGetActivityFeed();
  }
  const response = await apiClient.get<ActivityItem[]>("/dashboard/activity/");
  return response.data;
}
