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

vi.mock("@/lib/api/assistant", () => api);

describe("AssistantWidget", () => {
  beforeEach(() => {
    api.getAssistantConfig.mockResolvedValue({
      enabled: true,
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
    await userEvent.click(screen.getByRole("button", { name: /open realityng assistant/i }));

    expect(await screen.findByText("RealityNG Demo Assistant")).toBeInTheDocument();
    expect(screen.getByText("Guided demo mode")).toBeInTheDocument();
    expect(screen.getByText("Property search guidance")).toBeInTheDocument();

    await waitFor(() => expect(api.createConversation).toHaveBeenCalledTimes(1));
    await userEvent.type(screen.getByPlaceholderText("Ask about a property..."), "Hello");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Hello, I am the RealityNG Demo Assistant.")).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole("button", { name: /open realityng assistant/i }));
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
});
