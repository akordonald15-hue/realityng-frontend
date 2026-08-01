import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";

export type NotificationType =
  | "lead_stage_changed"
  | "follow_up_due"
  | "new_message"
  | "inquiry_created"
  | "inquiry_status_changed"
  | "viewing_confirmed"
  | "viewing_requested"
  | "viewing_rescheduled"
  | "viewing_cancelled"
  | "application_submitted"
  | "application_status_changed"
  | "system";

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export type Notification = {
  id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type NotificationListParams = {
  is_read?: boolean;
  notification_type?: NotificationType;
  page?: number;
};

const EMPTY_NOTIFICATIONS: PaginatedResponse<Notification> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export async function listNotifications(
  params?: NotificationListParams,
): Promise<PaginatedResponse<Notification>> {
  if (USE_MOCKS) {
    return EMPTY_NOTIFICATIONS;
  }
  const response = await apiClient.get<PaginatedResponse<Notification>>(
    "/notifications/",
    { params },
  );
  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (USE_MOCKS) {
    return 0;
  }
  const response = await apiClient.get<{ count: number }>(
    "/notifications/unread-count/",
  );
  return response.data.count;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<Notification> {
  const response = await apiClient.post<Notification>(
    `/notifications/${notificationId}/mark-read/`,
  );
  return response.data;
}

export async function markAllNotificationsRead(): Promise<{ marked: number }> {
  const response = await apiClient.post<{ marked: number }>(
    "/notifications/mark-all-read/",
  );
  return response.data;
}
