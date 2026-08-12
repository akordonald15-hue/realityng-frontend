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

export type NotificationPreference = {
  id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  lead_notifications: boolean;
  viewing_notifications: boolean;
  application_notifications: boolean;
  message_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateNotificationPreferencePayload = Partial<
  Pick<
    NotificationPreference,
    | "in_app_enabled"
    | "email_enabled"
    | "lead_notifications"
    | "viewing_notifications"
    | "application_notifications"
    | "message_notifications"
  >
>;

export type NotificationListParams = {
  is_read?: boolean;
  notification_type?: NotificationType;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const EMPTY_NOTIFICATIONS: Notification[] = [];

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export async function listNotifications(params?: NotificationListParams): Promise<Notification[]> {
  if (USE_MOCKS) {
    return EMPTY_NOTIFICATIONS;
  }
  const response = await apiClient.get<Notification[] | PaginatedResponse<Notification>>("/notifications/", {
    params,
  });
  return unwrapList(response.data);
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (USE_MOCKS) {
    return 0;
  }
  const response = await apiClient.get<{ count?: number; unread_count?: number }>(
    "/notifications/unread-count/",
  );
  return response.data.count ?? response.data.unread_count ?? 0;
}

export async function markNotificationRead(notificationId: string): Promise<Notification> {
  const response = await apiClient.post<Notification>(
    `/notifications/${notificationId}/mark-read/`,
  );
  return response.data;
}

export async function markAllNotificationsRead(): Promise<{ marked: number }> {
  const response = await apiClient.post<{ marked?: number; marked_read?: number }>(
    "/notifications/mark-all-read/",
  );
  return { marked: response.data.marked ?? response.data.marked_read ?? 0 };
}

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  const response = await apiClient.get<NotificationPreference>("/notification-preferences/me/");
  return response.data;
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencePayload,
): Promise<NotificationPreference> {
  const response = await apiClient.patch<NotificationPreference>(
    "/notification-preferences/me/",
    payload,
  );
  return response.data;
}
