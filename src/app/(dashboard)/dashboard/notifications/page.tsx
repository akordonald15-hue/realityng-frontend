"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api/notifications";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const handleRealtimeNotification = useCallback(
    (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (current = []) => {
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }
        return [notification, ...current];
      });
    },
    [queryClient],
  );

  useNotificationSocket({
    enabled: true,
    onNotification: handleRealtimeNotification,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const hasUnread = notifications.some((notification) => !notification.is_read);

  function handleClick(notification: Notification) {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <div className="flex items-center justify-between gap-2">
          <SectionHeader
            description="Updates on your leads, viewings, applications, and messages."
            title="Notifications"
          />
          {hasUnread && (
            <Button
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              variant="ghost"
            >
              Mark all read
            </Button>
          )}
          <Link
            className="text-sm font-semibold text-brand-secondary hover:underline"
            href="/settings/notifications"
          >
            Preferences
          </Link>
        </div>

        <section className="mt-6 flex flex-col gap-2">
          {notificationsQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                className="w-full text-left"
                key={notification.id}
                onClick={() => handleClick(notification)}
                type="button"
              >
                <Card className={`p-3 ${notification.is_read ? "" : "border-brand-secondary/40"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        notification.is_read ? "text-brand-muted" : "text-brand-text"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-secondary" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-muted">{notification.body}</p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </Card>
              </button>
            ))
          ) : (
            <p className="text-sm text-brand-muted">No notifications yet.</p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
