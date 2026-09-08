"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageContainer } from "@/components/layout/page-container";
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
      <main className="min-h-screen bg-reality-bg-muted py-8 text-reality-text-primary sm:py-14">
        <PageContainer className="max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            description="Updates on your leads, viewings, applications, and messages."
            title="Notifications"
          />
          <div className="flex flex-wrap items-center gap-3">
            {hasUnread && (
              <Button
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
                variant="realityGhost"
              >
                Mark all read
              </Button>
            )}
            <Link
              className="text-sm font-semibold text-reality-brand-600 transition hover:text-reality-brand-700 hover:underline"
              href="/settings/notifications"
            >
              Preferences
            </Link>
          </div>
        </div>

        <section className="mt-6 flex flex-col gap-3">
          {notificationsQuery.isLoading ? (
            <Card className="rounded-[18px] p-4 text-sm text-reality-text-quaternary" variant="reality">
              Loading notifications...
            </Card>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                className="w-full rounded-[18px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
                key={notification.id}
                onClick={() => handleClick(notification)}
                type="button"
              >
                <Card
                  className={`rounded-[18px] p-4 transition hover:border-reality-brand-500/30 hover:shadow-reality-sm ${
                    notification.is_read ? "" : "border-reality-brand-500/35"
                  }`}
                  variant="reality"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        notification.is_read
                          ? "text-reality-text-quaternary"
                          : "text-reality-text-primary"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-reality-brand-500" />
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-reality-text-quaternary">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-reality-text-quaternary">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </Card>
              </button>
            ))
          ) : (
            <Card className="rounded-[18px] p-5 text-sm text-reality-text-quaternary" variant="reality">
              No notifications yet.
            </Card>
          )}
        </section>
        </PageContainer>
      </main>
    </ProtectedRoute>
  );
}
