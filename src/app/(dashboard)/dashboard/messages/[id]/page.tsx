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
} from "@/lib/api/messages";

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const threadId = params.id;
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const threadQuery = useQuery({
    queryKey: ["message-thread", threadId],
    queryFn: () => getThread(threadId),
  });

  const messagesQuery = useQuery({
    queryKey: ["message-thread-messages", threadId],
    queryFn: () => listThreadMessages(threadId),
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(threadId, text),
    onSuccess: () => {
      setBody("");
      void queryClient.invalidateQueries({
        queryKey: ["message-thread-messages", threadId],
      });
    },
  });

  useEffect(() => {
    void markThreadRead(threadId);
  }, [threadId]);

  const mergeRealtimeMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<Message[]>(
        ["message-thread-messages", threadId],
        (current = []) => {
          if (current.some((item) => item.id === message.id)) {
            return current;
          }
          return [...current, message];
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
    [queryClient, threadId],
  );

  const { connectionState, sendRealtimeMessage } = useMessageSocket({
    enabled: Boolean(threadId),
    onMessage: mergeRealtimeMessage,
    threadId,
  });

  const messages = messagesQuery.data ?? [];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sendMutation.isPending) return;
    if (sendRealtimeMessage(trimmed)) {
      setBody("");
      return;
    }
    sendMutation.mutate(trimmed);
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
