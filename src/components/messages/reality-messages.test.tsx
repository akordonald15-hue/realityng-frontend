import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MessagesInboxPageContent,
  MessageThreadPageContent,
} from "@/components/messages/reality-messages";
import { renderWithQueryClient } from "@/test/render";

const mocks = vi.hoisted(() => ({
  getThread: vi.fn(),
  listThreadMessages: vi.fn(),
  listThreads: vi.fn(),
  markThreadRead: vi.fn(),
  replace: vi.fn(),
  sendMessage: vi.fn(),
  threadId: "thread-1",
  user: {
    id: "agent-1",
    first_name: "Agent",
    roles: [{ role: { name: "agent" }, status: "approved" }],
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: mocks.threadId }),
  usePathname: () => "/dashboard/messages",
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: mocks.user,
  }),
}));

vi.mock("@/hooks/use-message-socket", () => ({
  useMessageSocket: () => ({
    connectionState: "disconnected",
    sendRealtimeMessage: () => false,
  }),
}));

vi.mock("@/lib/api/messages", () => ({
  getThread: (threadId: string) => mocks.getThread(threadId),
  listThreadMessages: (threadId: string, options?: unknown) =>
    mocks.listThreadMessages(threadId, options),
  listThreads: () => mocks.listThreads(),
  markThreadRead: (threadId: string) => mocks.markThreadRead(threadId),
  sendMessage: (threadId: string, body: string, clientMessageId: string) =>
    mocks.sendMessage(threadId, body, clientMessageId),
}));

function thread(overrides = {}) {
  return {
    id: "thread-1",
    property: "property-1",
    inquiry: "inquiry-1",
    viewing: null,
    application: null,
    created_by: "buyer-123456",
    is_closed: false,
    participants: [
      { id: "participant-1", user: "agent-1", last_read_at: null },
      { id: "participant-2", user: "buyer-123456", last_read_at: null },
    ],
    last_message: {
      id: "message-1",
      thread: "thread-1",
      sender: "buyer-123456",
      body: "Can I inspect tomorrow?",
      client_message_id: null,
      thread_sequence: 1,
      edited_at: null,
      created_at: "2026-09-10T08:15:00Z",
    },
    unread_count: 2,
    created_at: "2026-09-10T08:00:00Z",
    updated_at: "2026-09-10T08:15:00Z",
    ...overrides,
  };
}

function message(overrides = {}) {
  return {
    id: "message-1",
    thread: "thread-1",
    sender: "buyer-123456",
    body: "Can I inspect tomorrow?",
    client_message_id: null,
    thread_sequence: 1,
    edited_at: null,
    created_at: "2026-09-10T08:15:00Z",
    ...overrides,
  };
}

function messagePage(results = [message()], overrides = {}) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
    ...overrides,
  };
}

describe("Reality messages", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: () => "client-message-1" });
    mocks.getThread.mockReset();
    mocks.listThreadMessages.mockReset();
    mocks.listThreads.mockReset();
    mocks.markThreadRead.mockReset();
    mocks.replace.mockReset();
    mocks.sendMessage.mockReset();
    mocks.threadId = "thread-1";
    mocks.user = {
      id: "agent-1",
      first_name: "Agent",
      roles: [{ role: { name: "agent" }, status: "approved" }],
    };
    mocks.listThreads.mockResolvedValue([thread()]);
    mocks.getThread.mockResolvedValue(thread());
    mocks.listThreadMessages.mockResolvedValue(
      messagePage([
        message({ id: "message-1", sender: "buyer-123456", body: "Can I inspect tomorrow?" }),
        message({
          id: "message-2",
          sender: "agent-1",
          body: "Yes, 10 AM works.",
          thread_sequence: 2,
        }),
      ]),
    );
    mocks.markThreadRead.mockResolvedValue({ marked_read: true });
    mocks.sendMessage.mockResolvedValue(
      message({
        id: "message-3",
        sender: "agent-1",
        body: "I will confirm shortly.",
        client_message_id: "client-message-1",
        thread_sequence: 3,
      }),
    );
  });

  it("renders the Figma-style empty inbox state", async () => {
    mocks.listThreads.mockResolvedValueOnce([]);

    renderWithQueryClient(<MessagesInboxPageContent />);

    expect(await screen.findByRole("heading", { name: "Messages" })).toBeInTheDocument();
    expect(await screen.findByText("No messages")).toBeInTheDocument();
    expect(
      screen.getByText("Conversations with buyers, tenants, owners, and agents will appear here."),
    ).toBeInTheDocument();
  });

  it("renders unread thread rows that link to the detail route", async () => {
    renderWithQueryClient(<MessagesInboxPageContent />);

    expect(await screen.findByText("Can I inspect tomorrow?")).toBeInTheDocument();
    expect(screen.getByLabelText("2 unread messages")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Can I inspect tomorrow?/ })).toHaveAttribute(
      "href",
      "/dashboard/messages/thread-1",
    );
  });

  it("renders conversation direction and sends messages through the existing API", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<MessageThreadPageContent />);

    expect(await screen.findByText("Can I inspect tomorrow?")).toBeInTheDocument();
    expect(screen.getByText("Yes, 10 AM works.")).toBeInTheDocument();
    await waitFor(() => expect(mocks.markThreadRead).toHaveBeenCalledWith("thread-1"));

    await user.type(screen.getByLabelText("Write a message"), "I will confirm shortly.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(mocks.sendMessage).toHaveBeenCalledWith(
        "thread-1",
        "I will confirm shortly.",
        "client-message-1",
      );
    });
    expect(await screen.findByText("I will confirm shortly.")).toBeInTheDocument();
  });

  it("keeps the draft visible when send fails", async () => {
    const user = userEvent.setup();
    mocks.sendMessage.mockRejectedValueOnce(new Error("Nope"));

    renderWithQueryClient(<MessageThreadPageContent />);

    await screen.findByText("Can I inspect tomorrow?");
    const composer = screen.getByLabelText("Write a message");
    await user.type(composer, "Please confirm.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Message could not be sent. Please try again.")).toBeInTheDocument();
    expect(composer).toHaveValue("Please confirm.");
  });

  it("handles invalid or unauthorized thread responses", async () => {
    mocks.getThread.mockRejectedValueOnce(new Error("Not found"));

    renderWithQueryClient(<MessageThreadPageContent />);

    expect(
      await screen.findByText("This conversation could not be opened, or you may not have access."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to messages" })).toHaveAttribute(
      "href",
      "/dashboard/messages",
    );
  });

  it("keeps the shared buyer messages route usable", async () => {
    mocks.user = {
      id: "buyer-123456",
      first_name: "Buyer",
      roles: [{ role: { name: "buyer" }, status: "approved" }],
    };

    renderWithQueryClient(<MessagesInboxPageContent />);

    expect(await screen.findByText("Can I inspect tomorrow?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Can I inspect tomorrow?/ })).toHaveAttribute(
      "href",
      "/dashboard/messages/thread-1",
    );
  });
});

