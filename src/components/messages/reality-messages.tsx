"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { FormMessage } from "@/components/forms/form-message";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMessageSocket } from "@/hooks/use-message-socket";
import {
  getThread,
  listThreadMessages,
  listThreads,
  markThreadRead,
  sendMessage,
  type ConversationThread,
  type Message,
  type MessagePage,
} from "@/lib/api/messages";
import { useAuth } from "@/providers/auth-provider";

type ThreadListProps = {
  activeThreadId?: string;
  compact?: boolean;
  currentUserId?: string;
  threads: ConversationThread[];
};

export function MessagesInboxPageContent() {
  const { user } = useAuth();
  const threadsQuery = useQuery({
    queryKey: ["message-threads"],
    queryFn: listThreads,
  });
  const threads = threadsQuery.data ?? [];

  return (
    <ProtectedRoute>
      <MessagesShell>
        <section className="mt-10">
          {threadsQuery.isLoading ? (
            <ThreadListSkeleton />
          ) : threadsQuery.isError ? (
            <Card className="p-8" variant="realityElevated">
              <FormMessage tone="error" variant="reality">
                Conversations could not be loaded. Please try again.
              </FormMessage>
              <Button className="mt-5" onClick={() => threadsQuery.refetch()} variant="reality">
                Retry
              </Button>
            </Card>
          ) : threads.length > 0 ? (
            <ThreadList currentUserId={user?.id} threads={threads} />
          ) : (
            <EmptyInboxState />
          )}
        </section>
      </MessagesShell>
    </ProtectedRoute>
  );
}

export function MessageThreadPageContent() {
  const params = useParams<{ id: string }>();
  const threadId = params.id;
  const { user } = useAuth();
  const currentUserId = user?.id;
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [nextHistoryPage, setNextHistoryPage] = useState<number | null>(null);
  const [pendingClientMessages, setPendingClientMessages] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const threadsQuery = useQuery({
    queryKey: ["message-threads"],
    queryFn: listThreads,
  });

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
    setSendError("");
  }, [threadId]);

  useEffect(() => {
    const page = messagesQuery.data;
    if (!page) return;
    setLoadedMessages((current) => mergeMessages(current, page.results));
    setNextHistoryPage(page.next ? historyPage + 1 : null);
  }, [historyPage, messagesQuery.data]);

  useEffect(() => {
    if (!threadId || threadQuery.isError) return;
    void markThreadRead(threadId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    });
  }, [queryClient, threadId, threadQuery.isError]);

  useEffect(() => {
    if (historyPage !== 1) return;
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [historyPage, loadedMessages.length, pendingClientMessages]);

  const mergeMessageIntoCache = useCallback(
    (message: Message) => {
      queryClient.setQueriesData<MessagePage>(
        { queryKey: ["message-thread-messages", threadId] },
        (current) => {
          if (!current) return current;
          const exists = current.results.some(
            (item) =>
              item.id === message.id ||
              (message.client_message_id && item.client_message_id === message.client_message_id),
          );
          if (exists) return current;
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
    const lastMessage = loadedMessages.at(-1);
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
  }, [loadedMessages, mergeMessageIntoCache, queryClient, threadId]);

  const sendMutation = useMutation({
    mutationFn: ({ clientMessageId, text }: { clientMessageId: string; text: string }) =>
      sendMessage(threadId, text, clientMessageId),
    onSuccess: (message) => {
      setBody("");
      setSendError("");
      mergeMessageIntoCache(message);
    },
    onError: () => {
      setSendError("Message could not be sent. Please try again.");
    },
  });

  const { connectionState, sendRealtimeMessage } = useMessageSocket({
    enabled: Boolean(threadId) && !threadQuery.isError,
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

  const activeThread = threadQuery.data;
  const threads = threadsQuery.data ?? [];
  const messages = loadedMessages;
  const hasMoreMessages = nextHistoryPage !== null;
  const emptyComposer = body.trim().length === 0;

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sendMutation.isPending || activeThread?.is_closed) return;
    const clientMessageId = crypto.randomUUID();
    setSendError("");
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

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    handleSubmit();
  }

  return (
    <ProtectedRoute>
      <MessagesShell>
        <section className="mt-8 grid min-w-0 gap-5 lg:grid-cols-[minmax(280px,0.4fr)_minmax(0,0.6fr)]">
          <div className="hidden lg:block">
            {threadsQuery.isLoading ? (
              <ThreadListSkeleton compact />
            ) : threadsQuery.isError ? (
              <InlineError message="Conversations could not be loaded." />
            ) : (
              <ThreadList
                activeThreadId={threadId}
                compact
                currentUserId={currentUserId}
                threads={threads}
              />
            )}
          </div>

          <ConversationPanel
            activeThread={activeThread}
            body={body}
            currentUserId={currentUserId}
            emptyComposer={emptyComposer}
            endRef={endRef}
            hasMoreMessages={hasMoreMessages}
            isLoading={threadQuery.isLoading || messagesQuery.isLoading}
            isThreadError={threadQuery.isError}
            messages={messages}
            onBodyChange={setBody}
            onComposerKeyDown={handleComposerKeyDown}
            onLoadMore={() => setHistoryPage(nextHistoryPage ?? historyPage)}
            onRetry={() => {
              void threadQuery.refetch();
              void messagesQuery.refetch();
            }}
            onSubmit={handleSubmit}
            pendingClientMessages={pendingClientMessages}
            realtimeState={connectionState}
            sendError={sendError}
            sending={sendMutation.isPending}
          />
        </section>
      </MessagesShell>
    </ProtectedRoute>
  );
}

function MessagesShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-reality-canvas pb-20 pt-8 text-reality-text-primary [color-scheme:light] lg:pt-10">
      <PageContainer>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-semibold">
          <Link
            className="text-reality-text-tertiary transition hover:text-reality-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <span className="text-reality-text-tertiary">›</span>
          <span className="text-reality-brand-600">Messages</span>
        </nav>
        <h1 className="mt-10 font-serif text-4xl font-semibold leading-tight text-reality-text-primary">
          Messages
        </h1>
        {children}
      </PageContainer>
    </main>
  );
}

function ThreadList({ activeThreadId, compact, currentUserId, threads }: ThreadListProps) {
  return (
    <div className={clsx("grid gap-4", compact ? "lg:max-w-[526px]" : "max-w-[1330px]")}>
      {threads.map((thread) => (
        <ThreadRow
          active={thread.id === activeThreadId}
          currentUserId={currentUserId}
          key={thread.id}
          thread={thread}
        />
      ))}
    </div>
  );
}

function ThreadRow({
  active,
  currentUserId,
  thread,
}: {
  active?: boolean;
  currentUserId?: string;
  thread: ConversationThread;
}) {
  const title = getThreadTitle(thread, currentUserId);
  const context = getThreadContext(thread);
  const preview = thread.last_message?.body ?? context;
  const timestamp = thread.last_message?.created_at ?? thread.updated_at;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group flex min-h-[88px] items-center gap-4 rounded-[20px] border bg-reality-surface px-4 py-4 transition duration-200 hover:border-reality-brand-300 hover:bg-reality-surfaceBrand focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500",
        active ? "border-reality-brand-300 bg-reality-surfaceBrand shadow-reality-xs" : "border-reality-border-secondary",
      )}
      href={`/dashboard/messages/${thread.id}`}
    >
      <AvatarInitials label={title} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <p className="truncate text-base font-semibold text-reality-text-primary">{title}</p>
          <time className="shrink-0 text-xs font-medium text-reality-text-secondary">
            {formatMessageTime(timestamp)}
          </time>
        </div>
        <p
          className={clsx(
            "mt-1 truncate text-sm leading-5",
            thread.unread_count > 0
              ? "font-semibold text-reality-text-primary"
              : "text-reality-text-secondary",
          )}
        >
          {preview}
        </p>
      </div>
      {thread.unread_count > 0 ? (
        <span
          aria-label={`${thread.unread_count} unread messages`}
          className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#bc8936] px-2 text-xs font-semibold text-white"
        >
          {thread.unread_count > 9 ? "9+" : thread.unread_count}
        </span>
      ) : null}
    </Link>
  );
}

function ConversationPanel({
  activeThread,
  body,
  currentUserId,
  emptyComposer,
  endRef,
  hasMoreMessages,
  isLoading,
  isThreadError,
  messages,
  onBodyChange,
  onComposerKeyDown,
  onLoadMore,
  onRetry,
  onSubmit,
  pendingClientMessages,
  realtimeState,
  sendError,
  sending,
}: {
  activeThread?: ConversationThread;
  body: string;
  currentUserId?: string;
  emptyComposer: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  hasMoreMessages: boolean;
  isLoading: boolean;
  isThreadError: boolean;
  messages: Message[];
  onBodyChange: (value: string) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onSubmit: (event?: FormEvent) => void;
  pendingClientMessages: Record<string, string>;
  realtimeState: "idle" | "connecting" | "connected" | "disconnected";
  sendError: string;
  sending: boolean;
}) {
  if (isThreadError) {
    return (
      <Card className="min-h-[420px] p-8" variant="realityElevated">
        <InlineError message="This conversation could not be opened, or you may not have access." />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={onRetry} variant="reality">
            Retry
          </Button>
          <Link className={buttonClasses("realitySecondary")} href="/dashboard/messages">
            Back to messages
          </Link>
        </div>
      </Card>
    );
  }

  const title = activeThread ? getThreadTitle(activeThread, currentUserId) : "Conversation";
  const context = activeThread ? getThreadContext(activeThread) : "Loading conversation";

  return (
    <Card
      className="flex min-h-[min(679px,75vh)] min-w-0 flex-col overflow-hidden rounded-[24px] border-reality-border-secondary bg-reality-surface"
      variant="reality"
    >
      <header className="flex items-center gap-4 border-b border-reality-border-secondary bg-reality-surfaceMuted px-5 py-5">
        <AvatarInitials label={title} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-reality-text-primary">{title}</p>
          <p className="mt-1 text-sm font-medium text-reality-text-secondary">{context}</p>
        </div>
        <div className="hidden text-right text-xs text-reality-text-tertiary sm:block">
          <p>Realtime</p>
          <p className="font-semibold text-reality-text-secondary">
            {realtimeState === "connected" ? "Connected" : "Standard delivery"}
          </p>
        </div>
      </header>

      <div className="min-h-[280px] flex-1 overflow-y-auto px-5 py-6">
        {hasMoreMessages ? (
          <Button className="mx-auto mb-5 flex" onClick={onLoadMore} variant="realitySecondary">
            Load more messages
          </Button>
        ) : null}

        {isLoading ? (
          <ConversationSkeleton />
        ) : messages.length > 0 || Object.keys(pendingClientMessages).length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                currentUserId={currentUserId}
                key={message.id}
                message={message}
              />
            ))}
            {Object.entries(pendingClientMessages).map(([clientMessageId, text]) => (
              <PendingBubble key={clientMessageId} text={text} />
            ))}
            <div ref={endRef} />
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <div>
              <p className="text-xl font-semibold text-reality-text-primary">No messages yet</p>
              <p className="mt-2 text-sm text-reality-text-secondary">
                Send a message to start this conversation.
              </p>
            </div>
          </div>
        )}
      </div>

      {activeThread?.is_closed ? (
        <div className="border-t border-reality-border-secondary px-5 py-5">
          <FormMessage tone="info" variant="reality">
            This conversation is closed.
          </FormMessage>
        </div>
      ) : (
        <form
          className="border-t border-reality-border-secondary bg-white px-4 py-4"
          onSubmit={onSubmit}
        >
          <label className="sr-only" htmlFor="message-composer">
            Write a message
          </label>
          <div className="flex flex-col gap-3 rounded-[22px] border border-reality-border-secondary bg-white p-3 shadow-reality-xs sm:flex-row sm:items-end">
            <textarea
              className="min-h-[54px] flex-1 resize-none rounded-[16px] border-0 bg-reality-bg-subtle px-4 py-3 text-sm text-reality-text-primary outline-none transition placeholder:text-reality-text-tertiary focus:bg-white focus:ring-2 focus:ring-reality-brand-500"
              id="message-composer"
              onChange={(event) => onBodyChange(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder="Write a message..."
              rows={2}
              value={body}
            />
            <Button
              className="h-11 px-6"
              disabled={emptyComposer || sending}
              type="submit"
              variant="reality"
            >
              {sending ? "Sending" : "Send"}
            </Button>
          </div>
          {sendError ? (
            <FormMessage className="mt-3" tone="error" variant="reality">
              {sendError}
            </FormMessage>
          ) : null}
        </form>
      )}
    </Card>
  );
}

function MessageBubble({ currentUserId, message }: { currentUserId?: string; message: Message }) {
  const outgoing = currentUserId ? message.sender === currentUserId : false;
  return (
    <article className={clsx("flex", outgoing ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[min(82%,620px)] rounded-[22px] px-4 py-3 shadow-reality-xs",
          outgoing
            ? "bg-reality-brand-500 text-white"
            : "border border-reality-border-secondary bg-reality-bg-subtle text-reality-text-primary",
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
        <time
          className={clsx(
            "mt-2 block text-xs",
            outgoing ? "text-white/75" : "text-reality-text-tertiary",
          )}
        >
          {formatMessageTime(message.created_at)}
        </time>
      </div>
    </article>
  );
}

function PendingBubble({ text }: { text: string }) {
  return (
    <article className="flex justify-end">
      <div className="max-w-[min(82%,620px)] rounded-[22px] border border-dashed border-reality-brand-300 bg-reality-brand-50 px-4 py-3 text-reality-text-primary opacity-90">
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{text}</p>
        <p className="mt-2 text-xs text-reality-text-tertiary">Sending...</p>
      </div>
    </article>
  );
}

function EmptyInboxState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center text-center">
      <div>
        <p className="text-2xl font-semibold text-reality-text-primary">No messages</p>
        <p className="mt-3 max-w-[374px] text-base leading-6 text-reality-text-secondary">
          Conversations with buyers, tenants, owners, and agents will appear here.
        </p>
      </div>
    </div>
  );
}

function ThreadListSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className={clsx("grid gap-4", compact ? "lg:max-w-[526px]" : "max-w-[1330px]")}>
      {[0, 1, 2].map((item) => (
        <div
          className="h-[88px] animate-pulse rounded-[24px] border border-reality-border-secondary bg-reality-bg-subtle"
          key={item}
        />
      ))}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div
          className={clsx(
            "h-16 animate-pulse rounded-[22px] bg-reality-bg-subtle",
            item % 2 ? "ml-auto w-2/3" : "w-3/4",
          )}
          key={item}
        />
      ))}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <FormMessage tone="error" variant="reality">
      {message}
    </FormMessage>
  );
}

function AvatarInitials({ label }: { label: string }) {
  const initials = getInitials(label);
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-reality-bg-muted text-sm font-semibold text-reality-text-secondary"
    >
      {initials}
    </span>
  );
}

function getThreadTitle(thread: ConversationThread, currentUserId?: string) {
  const participant = thread.participants.find((item) => item.user !== currentUserId);
  const userId = participant?.user ?? thread.created_by;
  return userId ? `User ${shortId(userId)}` : "Conversation";
}

function getThreadContext(thread: ConversationThread) {
  if (thread.application) return "Application request";
  if (thread.viewing) return "Viewing request";
  if (thread.inquiry) return "Property inquiry";
  return "Property conversation";
}

function getInitials(label: string) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "R";
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function shortId(value: string) {
  return value.slice(0, 8);
}

function formatMessageTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
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
  return merged.sort((left, right) => {
    if (left.thread_sequence !== null && right.thread_sequence !== null) {
      return left.thread_sequence - right.thread_sequence;
    }
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
  });
}

