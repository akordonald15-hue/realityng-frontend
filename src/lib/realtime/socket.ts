import { getAccessToken } from "@/lib/auth/token-storage";

export const REALITYNG_SOCKET_PROTOCOL = "realityng.websocket.v1";

export function buildWebSocketUrl(path: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path.startsWith("/") ? path : `/${path}`;
  url.search = "";
  return url.toString();
}

export function createRealityNgWebSocket(path: string): WebSocket | null {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return null;
  }
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  return new WebSocket(buildWebSocketUrl(path), [
    REALITYNG_SOCKET_PROTOCOL,
    `access_token.${token}`,
  ]);
}
