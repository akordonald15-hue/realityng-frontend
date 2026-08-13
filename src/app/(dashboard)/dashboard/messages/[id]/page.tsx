"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { useMessageSocket } from "@/hooks/use-message-socket";
import {
  getThread,
  listThreadMessages,
  markThreadRead,
  sendMessage,
  type Message,
  type MessagePage,
} from "@/lib/api/messages";

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const threadId = params.id;
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [nextHistoryPage, setNextHistoryPage] = useState<number | null>(null);
  const [pendingClientMessages, setPendingClientMessages] = useState<
    Record<string, string>
  >({});

  const threadQuery = useQuery({
    queryKey: ["message-thread", threadId],
    queryFn: () => getThread(threadId),
  });

  const messagesQuery = useQuery({
    queryKey: ["message-thread-messages", threadId, historyPage],
    queryFn: () => listThreadMessages(threadId, { page: historyPage }),
  });

  useEffect(() => {
    setHistoryPage(1);
    setLoadedMessages([]);
    setNextHistoryPage(null);
    setPendingClientMessages({});
  }, [threadId]);

  useEffect(() => {
    const page = messagesQuery.data;
    if (!page) return;
    setLoadedMessages((current) => mergeMessages(current, page.results));
    setNextHistoryPage(page.next ? historyPage + 1 : null);
  }, [historyPage, messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: ({ clientMessageId, text }: { clientMessageId: string; text: string }) =>
      sendMessage(threadId, text, clientMessageId),
    onSuccess: (message) => {
      setBody("");
      mergeMessageIntoCache(message);
    },
  });

  useEffect(() => {
    void markThreadRead(threadId);
  }, [threadId]);

  const mergeMessageIntoCache = useCallback(
    (message: Message) => {
      queryClient.setQueriesData<MessagePage>(
        { queryKey: ["message-thread-messages", threadId] },
        (current) => {
          if (!current) {
            return current;
          }
          const exists = current.results.some(
            (item) =>
              item.id === message.id ||
              (message.client_message_id &&
                item.client_message_id === message.client_message_id),
          );
          if (exists) {
            return current;
          }
          return {
            ...current,
            count: current.count + 1,
            results: [...current.results, message],
          };
        },
      );
      setLoadedMessages((current) => mergeMessages(current, [message]));
      void queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
    [queryClient, threadId],
  );

  const syncMissedMessages = useCallback(async () => {
    const cached = queryClient.getQueryData<MessagePage>([
      "message-thread-messages",
      threadId,
      historyPage,
    ]);
    const lastMessage = cached?.results.at(-1);
    if (!lastMessage) {
      void queryClient.invalidateQueries({
        queryKey: ["message-thread-messages", threadId],
      });
      return;
    }
    try {
      const page = await listThreadMessages(threadId, { after: lastMessage.id });
      for (const message of page.results) {
        mergeMessageIntoCache(message);
      }
    } catch {
      void queryClient.invalidateQueries({
        queryKey: ["message-thread-messages", threadId],
      });
    }
  }, [historyPage, mergeMessageIntoCache, queryClient, threadId]);

  const { connectionState, sendRealtimeMessage } = useMessageSocket({
    enabled: Boolean(threadId),
    onAccepted: ({ client_message_id }) => {
      if (!client_message_id) return;
      setPendingClientMessages((current) => {
        const next = { ...current };
        delete next[client_message_id];
        return next;
      });
    },
    onMessage: mergeMessageIntoCache,
    onReconnect: syncMissedMessages,
    threadId,
  });

  const messages = loadedMessages;
  const hasMoreMessages = nextHistoryPage !== null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sendMutation.isPending) return;
    const clientMessageId = crypto.randomUUID();
    if (sendRealtimeMessage(trimmed, clientMessageId)) {
      setPendingClientMessages((current) => ({
        ...current,
        [clientMessageId]: trimmed,
      }));
      setBody("");
      return;
    }
    sendMutation.mutate({ clientMessageId, text: trimmed });
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl p-4">
        <SectionHeader
          description={
            threadQuery.data?.is_closed ? "This conversation is closed." : "Reply below."
          }
          title="Conversation"
        />
        <p className="mt-2 text-xs text-brand-muted">
          Realtime: {connectionState === "connected" ? "connected" : "standard delivery"}
        </p>

        <section className="mt-6 flex flex-col gap-3">
          {hasMoreMessages && (
            <Button
              className="self-center"
              onClick={() => setHistoryPage(nextHistoryPage ?? historyPage)}
              type="button"
              variant="secondary"
            >
              Load more messages
            </Button>
          )}
          {messagesQuery.isLoading ? (
            <p className="text-sm text-brand-muted">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <Card className="p-3" key={message.id}>
                <p className="text-sm text-brand-text">{message.body}</p>
                <p className="mt-1 text-xs text-brand-muted">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </Card>
            ))
          ) : (
            <p className="text-sm text-brand-muted">No messages yet.</p>
          )}
          {Object.entries(pendingClientMessages).map(([clientMessageId, text]) => (
            <Card className="border-dashed p-3 opacity-80" key={clientMessageId}>
              <p className="text-sm text-brand-text">{text}</p>
              <p className="mt-1 text-xs text-brand-muted">Sending...</p>
            </Card>
          ))}
        </section>

        {!threadQuery.data?.is_closed && (
          <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
            <input
              className="flex-1 rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-sm text-brand-text"
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a message..."
              value={body}
            />
            <Button disabled={sendMutation.isPending} type="submit">
              Send
            </Button>
          </form>
        )}
      </main>
    </ProtectedRoute>
  );
}

function mergeMessages(current: Message[], incoming: Message[]) {
  const seen = new Set(current.map((message) => message.id));
  const clientIds = new Set(
    current
      .map((message) => message.client_message_id)
      .filter((clientId): clientId is string => Boolean(clientId)),
  );
  const merged = [...current];
  for (const message of incoming) {
    if (seen.has(message.id)) continue;
    if (message.client_message_id && clientIds.has(message.client_message_id)) continue;
    seen.add(message.id);
    if (message.client_message_id) {
      clientIds.add(message.client_message_id);
    }
    merged.push(message);
  }
  return merged.sort(
    (left, right) => {
      if (left.thread_sequence !== null && right.thread_sequence !== null) {
        return left.thread_sequence - right.thread_sequence;
      }
      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    },
  );
}
