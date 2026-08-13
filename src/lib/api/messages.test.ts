import { describe, expect, it, vi } from "vitest";

import {
  createThread,
  getUnreadMessageCount,
  listThreadMessages,
  listThreads,
  markThreadRead,
  sendMessage,
} from "@/lib/api/messages";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/demo-mode", () => ({
  USE_MOCKS: false,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: mocks.get,
    post: mocks.post,
  },
}));

describe("message API client", () => {
  it("normalizes paginated thread and message responses", async () => {
    mocks.get.mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: [{ id: "thread-1" }] },
    });
    await expect(listThreads()).resolves.toEqual([{ id: "thread-1" }]);
    expect(mocks.get).toHaveBeenCalledWith("/messages/threads/");

    mocks.get.mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: [{ id: "message-1" }] },
    });
    await expect(listThreadMessages("thread-1")).resolves.toEqual({
      count: 1,
      next: null,
      previous: null,
      results: [{ id: "message-1" }],
    });
    expect(mocks.get).toHaveBeenCalledWith("/messages/threads/thread-1/messages/", {
      params: {},
    });
  });

  it("uses integrated thread mutation endpoints", async () => {
    mocks.post.mockResolvedValueOnce({ data: { id: "thread-1" } });
    await createThread({ property: "property-1", inquiry: "inquiry-1" });
    expect(mocks.post).toHaveBeenCalledWith("/messages/threads/", {
      property: "property-1",
      inquiry: "inquiry-1",
    });

    mocks.post.mockResolvedValueOnce({ data: { id: "message-1" } });
    await sendMessage("thread-1", "Hello", "client-id");
    expect(mocks.post).toHaveBeenCalledWith("/messages/threads/thread-1/messages/", {
      body: "Hello",
      client_message_id: "client-id",
    });

    mocks.post.mockResolvedValueOnce({ data: { marked_read: true } });
    await markThreadRead("thread-1");
    expect(mocks.post).toHaveBeenCalledWith("/messages/threads/thread-1/mark-read/");
  });

  it("supports unread message count endpoint", async () => {
    mocks.get.mockResolvedValueOnce({ data: { unread_count: 5 } });
    await expect(getUnreadMessageCount()).resolves.toBe(5);
    expect(mocks.get).toHaveBeenCalledWith("/messages/threads/unread-count/");
  });

  it("passes cursor and page options to message history", async () => {
    mocks.get.mockResolvedValueOnce({
      data: { count: 0, next: null, previous: null, results: [] },
    });

    await listThreadMessages("thread-1", { after: "message-1", page: 2 });

    expect(mocks.get).toHaveBeenCalledWith("/messages/threads/thread-1/messages/", {
      params: { after: "message-1", page: 2 },
    });
  });
});
