import { describe, expect, it, vi } from "vitest";

import {
  buildWebSocketUrl,
  createRealityNgWebSocket,
  REALITYNG_SOCKET_PROTOCOL,
} from "@/lib/realtime/socket";

const mocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
}));

vi.mock("@/lib/auth/token-storage", () => ({
  getAccessToken: mocks.getAccessToken,
}));

describe("realtime socket utilities", () => {
  it("converts API base URL into a websocket URL", () => {
    expect(buildWebSocketUrl("/ws/notifications/")).toBe(
      "ws://localhost:8000/ws/notifications/",
    );
  });

  it("creates sockets with token subprotocols instead of query tokens", () => {
    mocks.getAccessToken.mockReturnValue("access-token");
    const created: Array<{ url: string; protocols: string[] }> = [];

    vi.stubGlobal(
      "WebSocket",
      class FakeWebSocket {
        constructor(url: string, protocols: string[]) {
          created.push({ url, protocols });
        }
      },
    );

    createRealityNgWebSocket("/ws/messages/threads/thread-1/");

    expect(created[0]).toEqual({
      url: "ws://localhost:8000/ws/messages/threads/thread-1/",
      protocols: [REALITYNG_SOCKET_PROTOCOL, "access_token.access-token"],
    });
    expect(created[0].url).not.toContain("access-token");
    vi.unstubAllGlobals();
  });

  it("does not create a socket without an access token", () => {
    mocks.getAccessToken.mockReturnValue(null);
    expect(createRealityNgWebSocket("/ws/notifications/")).toBeNull();
  });
});
