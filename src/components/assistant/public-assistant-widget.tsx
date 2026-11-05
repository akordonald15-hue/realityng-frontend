"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  answerAssistant,
  getAssistantConfig,
  getAssistantResponseMode,
  type AssistantConfig,
  type KnowledgeAnswer,
} from "@/lib/api/assistant";
import { KnowledgeSources } from "@/components/assistant/knowledge-sources";
import { AssistantAvatar } from "@/components/assistant/assistant-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOptionalAuth } from "@/providers/auth-provider";

type PublicMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  answer?: KnowledgeAnswer;
};

const suggestions = [
  "Walk me through RealityNG",
  "How do I search for property?",
  "How do I verify a listing?",
  "How do I list a property?",
];

const navLinks = [
  { label: "Browse properties", href: "/properties" },
  { label: "Verification standards", href: "/verification-standards" },
  { label: "Safety guide", href: "/safety" },
  { label: "Create account", href: "/auth/sign-up" },
];

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PublicAssistantWidget() {
  const auth = useOptionalAuth();
  const [hasAppeared, setHasAppeared] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<PublicMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Welcome to RealityNG. I'm your AI property assistant. Ask me for approved guidance about the platform. Listing approval and professional verification are separate.",
    },
  ]);
  const hasInteractedRef = useRef(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const responseMode = getAssistantResponseMode(config);
  const helperText =
    responseMode === "demo"
      ? "Guided demo mode. No live model."
      : "Approved platform guidance. No live model.";
  const orbState = isResponding ? "thinking" : "idle";

  useEffect(() => {
    const appearTimer = setTimeout(() => {
      setHasAppeared(true);
      // The greeting panel overlays page content on small screens, so phones get
      // the collapsed launcher only and open the assistant by tapping it.
      if (window.matchMedia("(min-width: 640px)").matches) {
        setShowGreeting(true);
      }
    }, 1400);
    const minimizeTimer = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setShowGreeting(false);
      }
    }, 9500);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(minimizeTimer);
      generation.current += 1;
    };
  }, []);

  useEffect(() => {
    let active = true;
    generation.current += 1;
    busy.current = false;
    setMessages((previous) => previous.slice(0, 1));
    setDraft("");
    setIsResponding(false);
    void getAssistantConfig()
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch(() => {
        if (active) setConfig(null);
      });
    return () => {
      active = false;
      generation.current += 1;
    };
  }, [auth?.user?.id]);

  async function submitMessage(content: string) {
    const value = content.trim();
    if (!value || busy.current) return;
    if (!responseMode) {
      setUnavailable(true);
      return;
    }
    const request = ++generation.current;
    busy.current = true;
    hasInteractedRef.current = true;
    setShowGreeting(false);
    setIsResponding(true);
    setUnavailable(false);
    setDraft("");
    try {
      const answer = await answerAssistant(value, responseMode);
      if (request !== generation.current) return;
      // Do not echo sensitive input when the shared service flags it.
      setMessages((previous) => [
        ...previous,
        ...(answer.intent === "privacy"
          ? []
          : [{ id: createMessageId("user"), role: "user" as const, content: value }]),
        { id: createMessageId("assistant"), role: "assistant", content: answer.content, answer },
      ]);
    } catch {
      if (request === generation.current) setUnavailable(true);
    } finally {
      if (request === generation.current) {
        busy.current = false;
        setIsResponding(false);
      }
    }
  }

  function closeAssistant() {
    generation.current += 1;
    busy.current = false;
    setIsResponding(false);
    setIsOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }

  function openAssistant() {
    hasInteractedRef.current = true;
    setShowGreeting(false);
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div
        className={
          hasAppeared
            ? "pointer-events-none fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex max-w-[calc(100vw-2rem)] items-end gap-3 sm:right-6"
            : "hidden"
        }
      >
        {showGreeting ? (
          <div className="assistant-fade-scale assistant-glass-panel pointer-events-none max-w-[min(18rem,calc(100vw-6rem))] rounded-2xl p-4 text-sm leading-6 text-reality-text-primary sm:max-w-xs">
            <p className="font-semibold text-reality-brandEmphasis">RealityNG AI</p>
            <p className="mt-2 text-reality-text-secondary">{messages[0].content}</p>
          </div>
        ) : null}
        <button
          aria-label="Open RealityNG AI"
          className="assistant-fade-scale pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brandEmphasis focus-visible:ring-offset-2 sm:h-[4.5rem] sm:w-[4.5rem]"
          onClick={openAssistant}
          ref={launcherRef}
          type="button"
        >
          <AssistantAvatar state={orbState} size="launcher" />
          <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full bg-reality-surfaceDark px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-reality-sm backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            Ask Reality AI
          </span>
          <span className="sr-only">RealityNG AI</span>
        </button>
      </div>
    );
  }

  return (
    <Card
      aria-label="RealityNG AI assistant"
      className="assistant-fade-scale assistant-glass-panel fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 flex max-h-[min(35rem,calc(100svh-2rem))] flex-col overflow-hidden rounded-2xl p-0 sm:left-auto sm:right-6 sm:w-[24rem]"
      role="region"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeAssistant();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-reality-border-secondary bg-reality-surfaceBrand px-4 py-3">
        <div className="flex items-center gap-3">
          <AssistantAvatar state={orbState} size="sm" />
          <div>
            <h2 className="font-display text-lg font-semibold text-reality-text-primary">
              RealityNG AI
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-reality-brand-600">
              {helperText}
            </p>
          </div>
        </div>
        <button
          aria-label="Close RealityNG AI"
          className="flex h-10 w-10 items-center justify-center rounded-full text-reality-text-primary transition hover:bg-reality-surfaceMuted focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brandEmphasis"
          onClick={closeAssistant}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 5l14 14M19 5 5 19"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <div
        role="log"
        aria-label="Assistant messages"
        aria-live="polite"
        aria-relevant="additions"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-reality-canvas px-4 py-3"
      >
        {messages.map((message) => (
          <div
            className={
              message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
            }
            key={message.id}
          >
            <p
              className={
                message.role === "user"
                  ? "max-w-[86%] rounded-xl bg-reality-surfaceBrand px-3 py-2 text-sm leading-6 text-reality-text-primary"
                  : "max-w-[92%] rounded-xl border border-reality-border-secondary bg-reality-surface px-3 py-2 text-sm leading-6 text-reality-text-secondary"
              }
            >
              {message.content}
            </p>
            <KnowledgeSources answer={message.answer} />
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {(config?.suggested_prompts ?? suggestions).map((suggestion) => (
            <button
              className="rounded-xl border border-reality-border-primary bg-reality-surface px-3 py-1.5 text-xs font-semibold text-reality-brandEmphasis transition hover:bg-reality-surfaceBrand focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brandEmphasis"
              disabled={isResponding}
              key={suggestion}
              onClick={() => submitMessage(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {isResponding && <p role="status">Finding approved guidance…</p>}
        {unavailable && (
          <p role="status">
            Approved guidance is currently unavailable.{" "}
            <Link href="/contact" className="underline">
              Contact RealityNG
            </Link>{" "}
            or use the standard navigation.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => (
            <Link
              className="rounded-xl border border-reality-border-secondary bg-reality-surface px-3 py-2 text-center text-xs font-semibold text-reality-text-primary transition hover:border-reality-brandEmphasis"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <form
        className="flex items-center gap-2 border-t border-reality-border-secondary bg-reality-surface p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage(draft);
        }}
      >
        <Input
          aria-label="Ask RealityNG AI"
          className="flex-1"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask how RealityNG works..."
          ref={inputRef}
          value={draft}
        />
        <Button disabled={!draft.trim() || isResponding} type="submit">
          Ask
        </Button>
      </form>
    </Card>
  );
}
