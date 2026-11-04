import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { renderWithQueryClient } from "@/test/render";

const api = vi.hoisted(() => ({
  createConversation: vi.fn(),
  getAssistantConfig: vi.fn(),
  getConversation: vi.fn(),
  listConversations: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("@/lib/api/assistant", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/assistant")>()),
  ...api,
}));

describe("AssistantWidget", () => {
  beforeEach(() => {
    api.getAssistantConfig.mockResolvedValue({
      enabled: true,
      knowledge_enabled: true,
      provider_mode: "demo",
      label: "RealityNG Demo Assistant",
      supported_topics: ["Property search guidance", "Viewing request guidance"],
      suggested_prompts: ["Hello, what can you help me with?"],
    });
    api.createConversation.mockResolvedValue({
      id: "conversation-1",
      status: "active",
      provider: "demo",
      title: null,
      created_at: "2026-07-27T00:00:00Z",
      updated_at: "2026-07-27T00:00:00Z",
    });
    api.listConversations.mockResolvedValue([]);
    api.getConversation.mockResolvedValue({
      id: "conversation-1",
      status: "active",
      provider: "demo",
      title: null,
      created_at: "2026-07-27T00:00:00Z",
      updated_at: "2026-07-27T00:00:00Z",
      messages: [],
    });
  });

  it("renders backend-provided demo assistant label, topics, and response", async () => {
    api.sendMessage.mockResolvedValue({
      user_message: {
        id: "user-message-1",
        role: "user",
        content: "Hello",
        tool_calls: null,
        tool_results: null,
        token_count: null,
        created_at: "2026-07-27T00:00:01Z",
      },
      assistant_message: {
        id: "assistant-message-1",
        role: "assistant",
        content: "Hello, I am the RealityNG Demo Assistant.",
        tool_calls: null,
        tool_results: null,
        token_count: null,
        created_at: "2026-07-27T00:00:02Z",
      },
      provider_metadata: { provider: "demo", mode: "demo" },
    });

    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(screen.getByRole("button", { name: /open realityng ai assistant/i }));

    expect(await screen.findByText("RealityNG Demo Assistant")).toBeInTheDocument();
    expect(screen.getByText("Approved platform guidance")).toBeInTheDocument();
    expect(screen.getByText("Property search guidance")).toBeInTheDocument();

    await waitFor(() => expect(api.createConversation).toHaveBeenCalledTimes(1));
    await userEvent.type(screen.getByPlaceholderText("Ask about a property..."), "Hello");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Hello, I am the RealityNG Demo Assistant."),
    ).toBeInTheDocument();
  });

  it("prevents duplicate sends while a message is pending", async () => {
    let resolveSend: (value: unknown) => void = () => undefined;
    api.sendMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );

    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(screen.getByRole("button", { name: /open realityng ai assistant/i }));
    await waitFor(() => expect(api.createConversation).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText("Ask about a property...");
    await userEvent.type(input, "How do I request a viewing?");
    const sendButton = screen.getByRole("button", { name: "Send" });
    await userEvent.click(sendButton);
    await userEvent.click(sendButton);

    expect(api.sendMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSend({
        user_message: {
          id: "user-message-1",
          role: "user",
          content: "How do I request a viewing?",
          tool_calls: null,
          tool_results: null,
          token_count: null,
          created_at: "2026-07-27T00:00:01Z",
        },
        assistant_message: {
          id: "assistant-message-1",
          role: "assistant",
          content: "Open a property, show interest, then request a viewing.",
          tool_calls: null,
          tool_results: null,
          token_count: null,
          created_at: "2026-07-27T00:00:02Z",
        },
      });
    });
  });
  it("does not create a conversation against disabled or older knowledge config", async () => {
    api.getAssistantConfig.mockResolvedValue({ enabled: true, label: "RealityNG Assistant" });
    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(screen.getByRole("button", { name: /open realityng ai assistant/i }));
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
    expect(api.createConversation).not.toHaveBeenCalled();
  });

  it("closes with Escape and restores launcher focus", async () => {
    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(screen.getByRole("button", { name: /open realityng ai assistant/i }));
    await waitFor(() => expect(screen.getByLabelText("Ask RealityNG assistant")).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /open realityng ai assistant/i })).toHaveFocus(),
    );
  });

  it("rejects a delayed send from A after switching to conversation B", async () => {
    let finish!: (value: unknown) => void;
    api.sendMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    api.listConversations.mockResolvedValue([
      { id: "conversation-b", title: "Conversation B", status: "active", updated_at: "2026-11-04" },
    ]);
    api.getConversation.mockResolvedValue({ id: "conversation-b", messages: [] });
    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(screen.getByRole("button", { name: /open realityng ai assistant/i }));
    await waitFor(() => expect(api.createConversation).toHaveBeenCalled());
    await userEvent.type(screen.getByLabelText("Ask RealityNG assistant"), "Question A");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    await userEvent.click(screen.getByRole("button", { name: "Show conversation history" }));
    await userEvent.click(await screen.findByRole("button", { name: /Conversation B/ }));
    await waitFor(() => expect(screen.queryByText("Question A")).not.toBeInTheDocument());
    await act(async () => {
      finish({
        user_message: { id: "old-user", role: "user", content: "Question A" },
        assistant_message: { id: "old-answer", role: "assistant", content: "Late A answer" },
      });
    });
    expect(screen.queryByText("Late A answer")).not.toBeInTheDocument();
    expect(screen.queryByText("Question A")).not.toBeInTheDocument();
  });
  it("preserves authenticated demo replies with knowledge disabled", async () => {
    api.getAssistantConfig.mockResolvedValue({
      enabled: true,
      provider_mode: "demo",
      demo_enabled: true,
      knowledge_enabled: false,
      label: "RealityNG Demo Assistant",
      supported_topics: [],
      suggested_prompts: [],
    });
    api.sendMessage.mockResolvedValue({
      user_message: { id: "demo-user", role: "user", content: "Hello" },
      assistant_message: {
        id: "demo-answer",
        role: "assistant",
        content: "Existing guided demo reply",
      },
    });
    renderWithQueryClient(<AssistantWidget />);
    await userEvent.click(
      screen.getByRole("button", { name: /open realityng (?:ai )?assistant/i }),
    );
    await waitFor(() => expect(screen.getByLabelText("Ask RealityNG assistant")).toBeEnabled());
    await userEvent.type(screen.getByLabelText("Ask RealityNG assistant"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Existing guided demo reply")).toBeInTheDocument();
    expect(api.sendMessage).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      content: "Hello",
      mode: "demo",
    });
    expect(screen.getByText("Guided demo mode")).toBeInTheDocument();
  });
});
