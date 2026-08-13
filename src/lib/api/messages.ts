import { apiClient } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/demo-mode";

export type ConversationParticipant = {
  id: string;
  user: string;
  last_read_at: string | null;
};

export type Message = {
  id: string;
  thread: string;
  sender: string;
  body: string;
  client_message_id: string | null;
  thread_sequence: number | null;
  edited_at: string | null;
  created_at: string;
};

export type ConversationThread = {
  id: string;
  property: string;
  inquiry: string | null;
  viewing: string | null;
  application: string | null;
  created_by: string;
  is_closed: boolean;
  participants: ConversationParticipant[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
};

export type CreateThreadPayload = {
  property: string;
  inquiry?: string;
  viewing?: string;
  application?: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type MessagePage = PaginatedResponse<Message>;

const EMPTY_THREADS: ConversationThread[] = [];

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export async function listThreads(): Promise<ConversationThread[]> {
  if (USE_MOCKS) {
    return EMPTY_THREADS;
  }
  const response = await apiClient.get<ConversationThread[] | PaginatedResponse<ConversationThread>>(
    "/messages/threads/",
  );
  return unwrapList(response.data);
}

export async function getThread(threadId: string): Promise<ConversationThread> {
  const response = await apiClient.get<ConversationThread>(
    `/messages/threads/${threadId}/`,
  );
  return response.data;
}

export async function createThread(
  payload: CreateThreadPayload,
): Promise<ConversationThread> {
  const response = await apiClient.post<ConversationThread>(
    "/messages/threads/",
    payload,
  );
  return response.data;
}

export async function listThreadMessages(
  threadId: string,
  options: { after?: string; page?: number } = {},
): Promise<MessagePage> {
  const response = await apiClient.get<Message[] | MessagePage>(
    `/messages/threads/${threadId}/messages/`,
    { params: options },
  );
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
}

export async function sendMessage(
  threadId: string,
  body: string,
  clientMessageId: string,
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/messages/threads/${threadId}/messages/`,
    { body, client_message_id: clientMessageId },
  );
  return response.data;
}

export async function markThreadRead(
  threadId: string,
): Promise<{ marked_read: boolean }> {
  const response = await apiClient.post<{ marked_read: boolean }>(
    `/messages/threads/${threadId}/mark-read/`,
  );
  return response.data;
}

export async function getUnreadMessageCount(): Promise<number> {
  const response = await apiClient.get<{ count?: number; unread_count?: number }>(
    "/messages/threads/unread-count/",
  );
  return response.data.count ?? response.data.unread_count ?? 0;
}
