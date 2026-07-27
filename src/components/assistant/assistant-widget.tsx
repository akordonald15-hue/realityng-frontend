"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createConversation,
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

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const assistantConfig = useQuery({
    queryKey: ["assistant-config"],
    queryFn: getAssistantConfig,
  });
  const conversationHistory = useQuery({
    queryKey: ["assistant-conversations"],
    queryFn: listConversations,
    enabled: showHistory,
  });

  async function loadConversation(id: string) {
    const conversation = await getConversation(id);
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    setShowHistory(false);
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
    setUnavailable(false);
    if (!ensureConversation.isPending) {
      ensureConversation.mutate();
    }
  }

  const ensureConversation = useMutation({
    mutationFn: createConversation,
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
      setUnavailable(false);
    },
    onError: () => {
      setUnavailable(true);
    },
  });

  const send = useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ content }) => {
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
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith("optimistic-")),
        response.user_message,
        response.assistant_message,
      ]);
      setUnavailable(false);
    },
    onError: () => {
      setUnavailable(true);
    },
  });

  useEffect(() => {
    if (typeof scrollRef.current?.scrollTo === "function") {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [messages]);

  function handleOpen() {
    setIsOpen(true);
    if (assistantConfig.data?.enabled === false) {
      setUnavailable(true);
      return;
    }
    if (!conversationId && !ensureConversation.isPending) {
      ensureConversation.mutate();
    }
  }

  function handleSend() {
    const content = draft.trim();
    if (!content || !conversationId || send.isPending) {
      return;
    }
    send.mutate({ conversationId, content });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-secondary text-brand-background shadow-glow transition hover:bg-[#e4b12b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2"
        aria-label="Open RealityNG assistant"
      >
        <ChatIcon />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 flex h-[min(32rem,calc(100vh-2rem))] w-auto flex-col p-0 sm:bottom-6 sm:left-auto sm:right-6 sm:h-[32rem] sm:w-[22rem]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-heading text-sm font-semibold text-brand-text">
            {assistantConfig.data?.label ?? "RealityNG Assistant"}
          </h2>
          {assistantConfig.data?.provider_mode === "demo" ? (
            <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              Guided demo mode
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="text-brand-muted transition hover:text-brand-text"
            aria-label={showHistory ? "Hide conversation history" : "Show conversation history"}
          >
            <HistoryIcon />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-brand-muted transition hover:text-brand-text"
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
            className="w-full rounded-md border border-brand-secondary/70 px-3 py-1.5 text-xs text-brand-secondary transition hover:bg-brand-secondary/10"
          >
            New Conversation
          </button>
          {conversationHistory.isLoading && (
            <p className="text-sm text-brand-muted">Loading conversations...</p>
          )}
          {conversationHistory.isError && (
            <p className="text-sm text-brand-muted">Could not load conversation history.</p>
          )}
          {conversationHistory.data?.length === 0 && (
            <p className="text-sm text-brand-muted">No previous conversations yet.</p>
          )}
          {conversationHistory.data?.map((conversation: AIConversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => loadConversation(conversation.id)}
              className="block w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm text-brand-text transition hover:bg-white/5"
            >
              <div className="truncate">{conversation.title ?? "Untitled conversation"}</div>
              <div className="text-xs text-brand-muted">
                {new Date(conversation.updated_at).toLocaleString()} - {conversation.status}
              </div>
            </button>
          ))}
        </div>
      )}

      {!showHistory && (
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && !ensureConversation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-brand-muted">
                {assistantConfig.data?.provider_mode === "demo"
                  ? "I can guide you through selected RealityNG workflows while live AI approval is pending."
                  : "Ask me to find a property, compare listings, or answer questions about RealityNG."}
              </p>
              {assistantConfig.data?.supported_topics?.length ? (
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                    Supported topics
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-brand-muted">
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
                    className="rounded-md border border-brand-secondary/70 bg-transparent px-3 py-1.5 text-xs text-brand-secondary transition hover:bg-brand-secondary/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ensureConversation.isPending && (
            <p className="text-sm text-brand-muted">Starting conversation...</p>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {send.isPending && (
            <p className="text-sm text-brand-muted">Thinking...</p>
          )}

          {unavailable && (
            <div className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-brand-muted">
              The assistant is temporarily unavailable.{" "}
              <a href="/properties" className="text-brand-secondary underline">
                Use standard search instead
              </a>
              .
            </div>
          )}
        </div>

      )}
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about a property..."
          disabled={!conversationId || send.isPending}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || !conversationId || send.isPending}
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
            ? "bg-brand-secondary text-brand-background"
            : "border border-white/10 bg-white/5 text-brand-text",
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

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.91-.32-4.14-.89L3 20l1.06-3.18C3.39 15.66 3 14.36 3 13c0-4.418 4.03-8 9-8s9 3.582 9 7.99Z"
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
