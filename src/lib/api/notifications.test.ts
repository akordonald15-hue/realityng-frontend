import { describe, expect, it, vi } from "vitest";

import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api/notifications";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/demo-mode", () => ({
  USE_MOCKS: false,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: mocks.get,
    patch: mocks.patch,
    post: mocks.post,
  },
}));

describe("notification API client", () => {
  it("normalizes paginated notification responses", async () => {
    mocks.get.mockResolvedValueOnce({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: "notification-1", title: "New message" }],
      },
    });

    const notifications = await listNotifications({ is_read: false });

    expect(mocks.get).toHaveBeenCalledWith("/notifications/", {
      params: { is_read: false },
    });
    expect(notifications).toEqual([{ id: "notification-1", title: "New message" }]);
  });

  it("supports current and legacy unread-count response keys", async () => {
    mocks.get.mockResolvedValueOnce({ data: { unread_count: 3 } });
    await expect(getUnreadNotificationCount()).resolves.toBe(3);

    mocks.get.mockResolvedValueOnce({ data: { count: 2 } });
    await expect(getUnreadNotificationCount()).resolves.toBe(2);
  });

  it("uses mark-read and mark-all-read endpoints", async () => {
    mocks.post.mockResolvedValueOnce({ data: { id: "notification-1", is_read: true } });
    await markNotificationRead("notification-1");
    expect(mocks.post).toHaveBeenCalledWith("/notifications/notification-1/mark-read/");

    mocks.post.mockResolvedValueOnce({ data: { marked_read: 4 } });
    await expect(markAllNotificationsRead()).resolves.toEqual({ marked: 4 });
    expect(mocks.post).toHaveBeenCalledWith("/notifications/mark-all-read/");
  });

  it("uses current-user preference endpoints", async () => {
    mocks.get.mockResolvedValueOnce({
      data: { id: "preference-1", email_enabled: true },
    });
    await expect(getNotificationPreferences()).resolves.toEqual({
      id: "preference-1",
      email_enabled: true,
    });
    expect(mocks.get).toHaveBeenCalledWith("/notification-preferences/me/");

    mocks.patch.mockResolvedValueOnce({
      data: { id: "preference-1", message_notifications: false },
    });
    await expect(
      updateNotificationPreferences({ message_notifications: false }),
    ).resolves.toEqual({
      id: "preference-1",
      message_notifications: false,
    });
    expect(mocks.patch).toHaveBeenCalledWith("/notification-preferences/me/", {
      message_notifications: false,
    });
  });
});
