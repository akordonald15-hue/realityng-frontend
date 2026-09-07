"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useOptionalAuth } from "@/providers/auth-provider";
import { useNotificationSocket } from "@/hooks/use-notification-socket";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/api/notifications";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type NotificationBellProps = {
  variant?: "legacy" | "reality";
};

export function NotificationBell({ variant = "legacy" }: NotificationBellProps) {
  const auth = useOptionalAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRealtimeNotification = useCallback(
    (notification: Notification, nextUnreadCount: number) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev].slice(0, 8);
      });
      setUnreadCount(nextUnreadCount);
    },
    [],
  );

  useNotificationSocket({
    enabled: isAuthenticated,
    onNotification: handleRealtimeNotification,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getUnreadNotificationCount()
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  async function handleOpen() {
    setIsLoading(true);
    try {
      const response = await listNotifications();
      setNotifications(response.slice(0, 8));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkRead(notification: Notification) {
    if (notification.is_read) return;
    const updated = await markNotificationRead(notification.id);
    setNotifications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  if (!isAuthenticated) {
    return null;
  }

  const isReality = variant === "reality";

  return (
    <details
      className="group relative"
      onToggle={(event) => {
        if ((event.target as HTMLDetailsElement).open) {
          void handleOpen();
        }
      }}
    >
      <summary
        aria-label="Notifications"
        className={
          isReality
            ? "relative flex h-10 w-10 list-none items-center justify-center rounded-full text-reality-text-tertiary transition hover:cursor-pointer hover:bg-reality-bg-muted hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 focus-visible:ring-offset-2"
            : "relative flex h-10 w-10 list-none items-center justify-center rounded-full transition hover:cursor-pointer hover:bg-white/10"
        }
      >
        <BellIcon className={isReality ? "h-5 w-5" : "h-5 w-5 text-brand-muted"} />
        {unreadCount > 0 && (
          <span
            className={
              isReality
                ? "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-reality-brand-500 px-1 text-[10px] font-semibold text-white"
                : "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-secondary px-1 text-[10px] font-semibold text-brand-background"
            }
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </summary>
      <div
        className={
          isReality
            ? "reality-menu absolute right-0 top-full z-50 mt-3 w-80 rounded-reality border border-reality-border-secondary bg-white p-2 shadow-reality-sm"
            : "absolute right-0 top-full mt-3 w-80 rounded-md border border-white/10 bg-brand-surface p-2 shadow-glow"
        }
      >
        <div
          className={
            isReality
              ? "flex items-center justify-between px-2 py-2 text-sm font-semibold text-reality-text-primary"
              : "flex items-center justify-between px-2 py-1 text-sm font-semibold text-brand-text"
          }
        >
          <span>Notifications</span>
          <div
            className={
              isReality
                ? "flex gap-2 text-xs font-semibold text-reality-brand-600"
                : "flex gap-2 text-xs font-medium text-brand-secondary"
            }
          >
            <Link className="hover:underline" href="/settings/notifications">
              Settings
            </Link>
            <Link className="hover:underline" href="/dashboard/notifications">
              View all
            </Link>
          </div>
        </div>
        {isLoading ? (
          <p
            className={
              isReality
                ? "px-2 py-5 text-sm text-reality-text-quaternary"
                : "px-2 py-4 text-sm text-brand-muted"
            }
          >
            Loading...
          </p>
        ) : notifications.length === 0 ? (
          <p
            className={
              isReality
                ? "rounded-[12px] bg-reality-bg-subtle px-3 py-5 text-sm text-reality-text-quaternary"
                : "px-2 py-4 text-sm text-brand-muted"
            }
          >
            No notifications yet.
          </p>
        ) : (
          <ul className="mt-1 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  className={
                    isReality
                      ? `block w-full rounded-[12px] px-3 py-2.5 text-left text-sm transition hover:bg-reality-bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500 ${
                          notification.is_read
                            ? "text-reality-text-quaternary"
                            : "text-reality-text-primary"
                        }`
                      : `block w-full rounded-sm px-2 py-2 text-left text-sm transition hover:bg-white/10 ${
                          notification.is_read ? "text-brand-muted" : "text-brand-text"
                        }`
                  }
                  onClick={() => void handleMarkRead(notification)}
                  type="button"
                >
                  <span className="block font-medium">{notification.title}</span>
                  <span
                    className={
                      isReality
                        ? "mt-0.5 block text-xs leading-5 text-reality-text-quaternary"
                        : "mt-0.5 block text-xs text-brand-muted"
                    }
                  >
                    {notification.body}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
