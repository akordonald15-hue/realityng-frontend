"use client";

import { useEffect, useRef, useState } from "react";

import type { Notification } from "@/lib/api/notifications";
import { createRealityNgWebSocket } from "@/lib/realtime/socket";

type NotificationSocketEvent = {
  type: "notification.created";
  notification: Notification;
  unread_count: number;
};

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected";

export function useNotificationSocket({
  enabled,
  onNotification,
}: {
  enabled: boolean;
  onNotification: (notification: Notification, unreadCount: number) => void;
}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let closedByEffect = false;

    function connect() {
      setConnectionState("connecting");
      const socket = createRealityNgWebSocket("/ws/notifications/");
      socketRef.current = socket;
      if (!socket) {
        setConnectionState("disconnected");
        return;
      }

      socket.onopen = () => {
        attemptsRef.current = 0;
        setConnectionState("connected");
      };
      socket.onmessage = (event) => {
        const payload = parseNotificationEvent(event.data);
        if (payload?.type === "notification.created") {
          onNotification(payload.notification, payload.unread_count);
        }
      };
      socket.onclose = () => {
        setConnectionState("disconnected");
        socketRef.current = null;
        if (closedByEffect || attemptsRef.current >= 3) {
          return;
        }
        attemptsRef.current += 1;
        reconnectRef.current = setTimeout(connect, 800 * attemptsRef.current);
      };
      socket.onerror = () => {
        setConnectionState("disconnected");
      };
    }

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, onNotification]);

  return { connectionState };
}

function parseNotificationEvent(data: string): NotificationSocketEvent | null {
  try {
    return JSON.parse(data) as NotificationSocketEvent;
  } catch {
    return null;
  }
}
