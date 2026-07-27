import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";
import type { Property } from "./properties";

export type AIConversationStatus = "active" | "closed" | "archived";

export type AIMessageRole = "user" | "assistant" | "system";

export type SearchPropertiesResult = {
  result_count: number;
  results: Property[];
};

export type ComparePropertiesResult = {
  properties: Property[];
  missing_property_ids: string[];
};

export type NavigateResult = {
  target: string;
  property_id: string | null;
  path: string | null;
};

export type ToolResult =
  | { tool_use_id: string; tool: "search_properties"; input: Record<string, unknown>; result: SearchPropertiesResult }
  | { tool_use_id: string; tool: "compare_properties"; input: Record<string, unknown>; result: ComparePropertiesResult }
  | { tool_use_id: string; tool: "navigate"; input: Record<string, unknown>; result: NavigateResult };

export type AIMessage = {
  id: string;
  role: AIMessageRole;
  content: string;
  tool_calls: Record<string, unknown>[] | null;
  tool_results: ToolResult[] | null;
  token_count: number | null;
  created_at: string;
};

export type AIConversation = {
  id: string;
  status: AIConversationStatus;
  provider: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AIConversationDetail = AIConversation & {
  messages: AIMessage[];
};

export type SendMessageResponse = {
  user_message: AIMessage;
  assistant_message: AIMessage;
};

export type AISearchResult = {
  query: string;
  extracted_filters: Record<string, unknown>;
  result_count: number;
  results: Property[];
};

function mockConversation(overrides: Partial<AIConversation> = {}): AIConversation {
  return {
    id: "mock-conversation-1",
    status: "active",
    provider: "anthropic",
    title: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function mockMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listConversations(): Promise<AIConversation[]> {
  if (USE_MOCKS) {
    return [mockConversation()];
  }
  const response = await apiClient.get<{ results: AIConversation[] }>("/conversations/");
  return response.data.results;
}

export async function createConversation(): Promise<AIConversation> {
  if (USE_MOCKS) {
    return mockConversation();
  }
  const response = await apiClient.post<AIConversation>("/conversations/", {});
  return response.data;
}

export async function getConversation(conversationId: string): Promise<AIConversationDetail> {
  if (USE_MOCKS) {
    return { ...mockConversation({ id: conversationId }), messages: [] };
  }
  const response = await apiClient.get<AIConversationDetail>(`/conversations/${conversationId}/`);
  return response.data;
}

export async function sendMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<SendMessageResponse> {
  if (USE_MOCKS) {
    return {
      user_message: {
        id: mockMessageId("mock-user-msg"),
        role: "user",
        content,
        tool_calls: null,
        tool_results: null,
        token_count: null,
        created_at: new Date().toISOString(),
      },
      assistant_message: {
        id: mockMessageId("mock-assistant-msg"),
        role: "assistant",
        content: "This is a mocked assistant reply.",
        tool_calls: null,
        tool_results: null,
        token_count: null,
        created_at: new Date().toISOString(),
      },
    };
  }
  const response = await apiClient.post<SendMessageResponse>(
    `/conversations/${conversationId}/messages/`,
    { content },
  );
  return response.data;
}

export async function searchWithAssistant(query: string): Promise<AISearchResult> {
  if (USE_MOCKS) {
    return { query, extracted_filters: {}, result_count: 0, results: [] };
  }
  const response = await apiClient.post<AISearchResult>("/assistant/search/", { query });
  return response.data;
}
