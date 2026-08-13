"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Message } from "@/lib/api/messages";
import { createRealityNgWebSocket } from "@/lib/realtime/socket";

type MessageSocketEvent =
  | { type: "message.created"; message: Message }
  | { type: "message.accepted"; message_id: string; client_message_id?: string | null }
  | { type: "error"; code: string; detail: unknown };

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected";

export function useMessageSocket({
  enabled,
  onAccepted,
  onMessage,
  onReconnect,
  threadId,
}: {
  enabled: boolean;
  onAccepted?: (payload: { message_id: string; client_message_id: string | null }) => void;
  onMessage: (message: Message) => void;
  onReconnect?: () => void;
  threadId: string;
}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!enabled || !threadId) {
      return undefined;
    }

    let closedByEffect = false;

    function connect() {
      setConnectionState("connecting");
      const socket = createRealityNgWebSocket(`/ws/messages/threads/${threadId}/`);
      socketRef.current = socket;
      if (!socket) {
        setConnectionState("disconnected");
        return;
      }

      socket.onopen = () => {
        const wasReconnect = attemptsRef.current > 0;
        attemptsRef.current = 0;
        setConnectionState("connected");
        if (wasReconnect) {
          onReconnect?.();
        }
      };
      socket.onmessage = (event) => {
        const payload = parseMessageEvent(event.data);
        if (payload?.type === "message.created") {
          onMessage(payload.message);
        }
        if (payload?.type === "message.accepted") {
          onAccepted?.({
            message_id: payload.message_id,
            client_message_id: payload.client_message_id ?? null,
          });
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
  }, [enabled, onAccepted, onMessage, onReconnect, threadId]);

  const sendRealtimeMessage = useCallback((body: string, clientMessageId: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    socket.send(
      JSON.stringify({
        type: "message.send",
        body,
        client_message_id: clientMessageId,
      }),
    );
    return true;
  }, []);

  return { connectionState, sendRealtimeMessage };
}

function parseMessageEvent(data: string): MessageSocketEvent | null {
  try {
    return JSON.parse(data) as MessageSocketEvent;
  } catch {
    return null;
  }
}
