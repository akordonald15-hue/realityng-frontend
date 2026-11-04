"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { AssistantAvatar } from "@/components/assistant/assistant-avatar";
import { useOptionalAuth } from "@/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createConversation,
  getAssistantResponseMode,
  type AssistantResponseMode,
  getAssistantConfig,
  sendMessage,
  listConversations,
  getConversation,
  type AIMessage,
  type AIConversation,
} from "@/lib/api/assistant";
import { ToolResultCards } from "@/components/assistant/result-cards";

function createMockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AssistantWidget({
  mobileNavigationOffset = false,
}: {
  mobileNavigationOffset?: boolean;
}) {
  const auth = useOptionalAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [showHistory, setShowHistory] = useState(false);
  const assistantConfig = useQuery({
    queryKey: ["assistant-config"],
    queryFn: getAssistantConfig,
  });
  const responseMode = getAssistantResponseMode(assistantConfig.data);
  const conversationHistory = useQuery({
    queryKey: ["assistant-conversations", auth?.user?.id],
    queryFn: listConversations,
    enabled: showHistory,
  });

  useEffect(() => {
    generation.current += 1;
    setConversationId(null);
    setMessages([]);
    setDraft("");
    setIsOpen(false);
  }, [auth?.user?.id]);

  async function loadConversation(id: string) {
    const request = ++generation.current;
    setConversationId(null);
    setMessages([]);
    try {
      const conversation = await getConversation(id);
      if (request !== generation.current) return;
      setConversationId(conversation.id);
      setMessages(conversation.messages);
      setShowHistory(false);
    } catch {
      if (request === generation.current) setUnavailable(true);
    }
  }

  function startNewConversation() {
    const request = ++generation.current;
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
    setUnavailable(false);
    if (responseMode && !ensureConversation.isPending) {
      ensureConversation.mutate(request);
    }
  }

  const ensureConversation = useMutation({
    mutationFn: (_request: number) => createConversation(),
    onSuccess: (conversation, request) => {
      if (request !== generation.current) return;
      setConversationId(conversation.id);
      setUnavailable(false);
    },
    onError: (_error, request) => {
      if (request === generation.current) setUnavailable(true);
    },
  });

  const send = useMutation({
    mutationFn: ({
      conversationId,
      content,
      mode,
    }: {
      conversationId: string;
      content: string;
      request: number;
      mode: AssistantResponseMode;
    }) => sendMessage({ conversationId, content, mode }),
    onMutate: async ({ content, request }) => {
      if (request !== generation.current) return;
      const optimisticUserMessage: AIMessage = {
        id: createMockId("optimistic"),
        role: "user",
        content,
        tool_calls: null,
        tool_results: null,
        token_count: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);
      setDraft("");
    },
    onSuccess: (response, variables) => {
      if (variables.request !== generation.current) return;
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith("optimistic-")),
        response.user_message,
        response.assistant_message,
      ]);
      setUnavailable(false);
    },
    onError: (_error, variables) => {
      if (variables.request !== generation.current) return;
      setMessages((previous) =>
        previous.filter((message) => !message.id.startsWith("optimistic-")),
      );
      setUnavailable(true);
    },
  });

  useEffect(() => {
    if (typeof scrollRef.current?.scrollTo === "function") {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !showHistory) {
      inputRef.current?.focus();
    }
  }, [conversationId, isOpen, showHistory]);

  function handleOpen() {
    setIsOpen(true);
    if (!responseMode) {
      setUnavailable(true);
      return;
    }
    if (!conversationId && !ensureConversation.isPending) {
      ensureConversation.mutate(generation.current);
    }
  }

  function handleSend() {
    const content = draft.trim();
    if (!content || !conversationId || send.isPending || !responseMode) {
      return;
    }
    send.mutate({ conversationId, content, request: generation.current, mode: responseMode });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        ref={launcherRef}
        className={clsx(
          "group fixed right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#062820]",
          mobileNavigationOffset ? "bottom-24 sm:bottom-6" : "bottom-6",
        )}
        aria-label="Open RealityNG AI assistant"
      >
        <AssistantAvatar state="idle" size="md" />
        <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full border border-cyan-100/20 bg-[#062820]/88 px-3 py-1.5 text-xs font-semibold text-cyan-50 opacity-0 shadow-reality-sm backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
          Ask Reality AI
        </span>
      </button>
    );
  }

  return (
    <Card
      aria-label="RealityNG AI assistant"
      className={clsx(
        "assistant-fade-scale assistant-glass-panel fixed left-4 right-4 z-50 flex w-auto flex-col rounded-2xl p-0 sm:bottom-6 sm:left-auto sm:right-6 sm:h-[32rem] sm:w-[23rem]",
        mobileNavigationOffset
          ? "bottom-24 h-[min(32rem,calc(100svh-7rem))]"
          : "bottom-4 h-[min(32rem,calc(100svh-2rem))]",
      )}
      role="region"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setIsOpen(false);
          window.setTimeout(() => launcherRef.current?.focus(), 0);
        }
      }}
    >
      <div className="flex items-center justify-between border-b border-brand-secondary/20 bg-reality-bg-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          <AssistantAvatar state={send.isPending ? "thinking" : "idle"} size="sm" />
          <div>
            <h2 className="font-display text-sm font-semibold text-reality-text-primary">
              {assistantConfig.data?.label ?? "RealityNG Assistant"}
            </h2>
            {assistantConfig.data?.provider_mode === "demo" ? (
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-reality-brand-600">
                {responseMode === "demo" ? "Guided demo mode" : "Approved platform guidance"}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="text-reality-text-secondary transition hover:text-reality-text-primary"
            aria-label={showHistory ? "Hide conversation history" : "Show conversation history"}
          >
            <HistoryIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              window.setTimeout(() => launcherRef.current?.focus(), 0);
            }}
            className="text-reality-text-secondary transition hover:text-reality-text-primary"
            aria-label="Close assistant"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          <button
            type="button"
            onClick={startNewConversation}
            className="w-full rounded-md border border-brand-secondary/70 px-3 py-1.5 text-xs text-reality-brand-600 transition hover:bg-brand-secondary/10"
          >
            New Conversation
          </button>
          {conversationHistory.isLoading && (
            <p className="text-sm text-reality-text-secondary">Loading conversations...</p>
          )}
          {conversationHistory.isError && (
            <p className="text-sm text-reality-text-secondary">
              Could not load conversation history.
            </p>
          )}
          {conversationHistory.data?.length === 0 && (
            <p className="text-sm text-reality-text-secondary">No previous conversations yet.</p>
          )}
          {conversationHistory.data?.map((conversation: AIConversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => loadConversation(conversation.id)}
              className="block w-full rounded-md border border-reality-border-secondary px-3 py-2 text-left text-sm text-reality-text-primary transition hover:bg-reality-bg-subtle"
            >
              <div className="truncate">{conversation.title ?? "Untitled conversation"}</div>
              <div className="text-xs text-reality-text-secondary">
                {new Date(conversation.updated_at).toLocaleString()} - {conversation.status}
              </div>
            </button>
          ))}
        </div>
      )}

      {!showHistory && (
        <div
          ref={scrollRef}
          role="log"
          aria-label="Assistant messages"
          aria-live="polite"
          aria-relevant="additions"
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 && !ensureConversation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-reality-text-secondary">
                {assistantConfig.data?.provider_mode === "demo"
                  ? "I provide approved RealityNG guidance without live model synthesis."
                  : "Ask for approved RealityNG workflow guidance. I cannot access private account records."}
              </p>
              {assistantConfig.data?.supported_topics?.length ? (
                <div className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-reality-brand-600">
                    Supported topics
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-reality-text-secondary">
                    {assistantConfig.data.supported_topics.slice(0, 6).map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(assistantConfig.data?.suggested_prompts ?? SUGGESTED_PROMPTS).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDraft(prompt)}
                    className="rounded-md border border-brand-secondary/70 bg-transparent px-3 py-1.5 text-xs text-reality-brand-600 transition hover:bg-brand-secondary/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ensureConversation.isPending && (
            <p className="text-sm text-reality-text-secondary">Starting conversation...</p>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {send.isPending && (
            <p role="status" className="text-sm text-reality-text-secondary">
              Finding approved guidance...
            </p>
          )}

          {unavailable && (
            <div className="rounded-md border border-reality-border-secondary bg-reality-bg-subtle p-3 text-sm text-reality-text-secondary">
              The assistant is temporarily unavailable.{" "}
              <a href="/properties" className="text-reality-brand-600 underline">
                Use standard search instead
              </a>
              .
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-reality-border-secondary p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Ask RealityNG assistant"
          placeholder="Ask about a property..."
          ref={inputRef}
          disabled={!conversationId || send.isPending || !responseMode}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || !conversationId || send.isPending || !responseMode}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] rounded-md px-3 py-2 text-sm",
          isUser
            ? "bg-brand-secondary text-reality-text-primary"
            : "border border-reality-border-secondary bg-reality-bg-subtle text-reality-text-primary",
        )}
      >
        {message.content}
        {!isUser && message.tool_results && message.tool_results.length > 0 && (
          <ToolResultCards toolResults={message.tool_results} />
        )}
      </div>
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  "2-bedroom apartments in Lekki",
  "Compare properties I've saved",
  "How do I schedule a viewing?",
];

function HistoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
