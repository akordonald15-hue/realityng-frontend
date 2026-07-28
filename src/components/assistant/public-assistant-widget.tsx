"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { AssistantOrb } from "@/components/assistant/assistant-orb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOptionalAuth } from "@/providers/auth-provider";

type PublicMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
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

function publicAssistantReply(input: string, isAuthenticated: boolean) {
  const text = input.toLowerCase();

  if (text.includes("walk") || text.includes("start") || text.includes("help")) {
    return [
      "Start by browsing approved listings without signing up.",
      "When you want to save, compare, show interest, request a viewing, apply, or list a property, RealityNG will guide you into an account flow.",
      isAuthenticated
        ? "Because you are signed in, your dashboard can also track saved properties, inquiries, viewings, applications, and verification progress."
        : "If you create an account later, your assistant can become more useful inside your dashboard.",
    ].join(" ");
  }

  if (text.includes("search") || text.includes("find") || text.includes("browse")) {
    return "Use the search tabs for Buy, Rent, Shortlets, Apartment Share, Land, or Commercial, then add a city, property type, or price range. You can browse results before creating an account.";
  }

  if (text.includes("verify") || text.includes("verification") || text.includes("trust")) {
    return "RealityNG separates public listing approval from deeper verification. You can read the verification standards publicly, then sign in when you need to submit identity, professional, or property evidence.";
  }

  if (text.includes("list") || text.includes("landlord") || text.includes("agent")) {
    return "To list property, create an account as a landlord or agent, complete your profile, create a draft listing, add details and media, then submit it for review.";
  }

  if (text.includes("viewing") || text.includes("tour") || text.includes("inspection")) {
    return "Open a property, show interest first, then use the dashboard workflow to request a physical or virtual viewing when the inquiry is active.";
  }

  if (text.includes("apply") || text.includes("application") || text.includes("rent")) {
    return "Rental applications happen after you choose a property and are ready to provide application details. The dashboard keeps your application status visible.";
  }

  if (text.includes("contact") || text.includes("support")) {
    return "For platform help, safety concerns, or partnerships, use the Contact page. For a specific property, use the structured Show Interest flow on the property page.";
  }

  return "I can help with a RealityNG walkthrough, property search guidance, verification guidance, listing steps, viewing requests, rental applications, and support routes. I do not provide legal advice, prices, availability, or private account data from this public assistant.";
}

export function PublicAssistantWidget() {
  const auth = useOptionalAuth();
  const [hasAppeared, setHasAppeared] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<PublicMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Welcome to RealityNG. I'm your AI property assistant. I can help you find verified properties, answer your questions, guide you through buying or renting, and make navigating the platform easier.",
    },
  ]);
  const hasInteractedRef = useRef(false);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const helperText = useMemo(
    () =>
      isAuthenticated
        ? "Signed-in users get richer dashboard guidance."
        : "Public walkthrough. No account required.",
    [isAuthenticated],
  );
  const orbState = isResponding
    ? "speaking"
    : isInputFocused || isOpen
      ? "listening"
      : showGreeting
        ? "speaking"
        : "idle";

  useEffect(() => {
    const appearTimer = setTimeout(() => {
      setHasAppeared(true);
      setShowGreeting(true);
    }, 1400);
    const minimizeTimer = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setShowGreeting(false);
      }
    }, 9500);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(minimizeTimer);
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  function submitMessage(content: string) {
    const value = content.trim();
    if (!value) return;

    hasInteractedRef.current = true;
    setShowGreeting(false);
    setIsResponding(true);
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
    }
    responseTimerRef.current = setTimeout(() => setIsResponding(false), 1200);
    setMessages((previous) => [
      ...previous,
      { id: createMessageId("user"), role: "user", content: value },
      {
        id: createMessageId("assistant"),
        role: "assistant",
        content: publicAssistantReply(value, isAuthenticated),
      },
    ]);
    setDraft("");
  }

  function openAssistant() {
    hasInteractedRef.current = true;
    setShowGreeting(false);
    setIsOpen(true);
  }

  if (!isOpen) {
    return (
      <div
        className={
          hasAppeared
            ? "pointer-events-none fixed bottom-5 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-end gap-3 sm:right-6"
            : "hidden"
        }
      >
        {showGreeting ? (
          <div className="assistant-fade-scale assistant-glass-panel pointer-events-auto max-w-[min(18rem,calc(100vw-6rem))] rounded-2xl p-4 text-sm leading-6 text-brand-text shadow-2xl sm:max-w-xs">
            <p className="font-semibold text-brand-lightGold">RealityNG AI</p>
            <p className="mt-2 text-brand-muted">{messages[0].content}</p>
          </div>
        ) : null}
        <button
          aria-label="Open RealityNG AI"
          className="assistant-fade-scale pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightGold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background sm:h-[4.5rem] sm:w-[4.5rem]"
          onClick={openAssistant}
          type="button"
        >
          <AssistantOrb state={orbState} size="md" />
          <span className="sr-only">RealityNG AI</span>
        </button>
      </div>
    );
  }

  return (
    <Card className="assistant-fade-scale assistant-glass-panel fixed bottom-4 left-4 right-4 z-50 flex max-h-[min(35rem,calc(100svh-2rem))] flex-col overflow-hidden rounded-2xl p-0 shadow-2xl sm:left-auto sm:right-6 sm:w-[24rem]">
      <div className="flex items-start justify-between gap-3 border-b border-brand-secondary/20 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <AssistantOrb state={orbState} size="sm" />
          <div>
            <h2 className="font-heading text-lg font-semibold text-brand-text">RealityNG AI</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              {helperText}
            </p>
          </div>
        </div>
        <button
          aria-label="Close RealityNG AI"
          className="rounded-md px-2 py-1 text-brand-muted transition hover:bg-white/10 hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightGold"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          x
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((message) => (
          <div
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            key={message.id}
          >
            <p
              className={
                message.role === "user"
                  ? "max-w-[86%] rounded-md bg-brand-secondary px-3 py-2 text-sm leading-6 text-brand-background"
                  : "max-w-[92%] rounded-md border border-brand-secondary/20 bg-white/5 px-3 py-2 text-sm leading-6 text-brand-muted"
              }
            >
              {message.content}
            </p>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-md border border-brand-secondary/60 px-3 py-1.5 text-xs font-semibold text-brand-secondary transition hover:bg-brand-secondary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
              key={suggestion}
              onClick={() => submitMessage(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => (
            <Link
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-brand-text transition hover:border-brand-secondary/60"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <form
        className="flex items-center gap-2 border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage(draft);
        }}
      >
        <Input
          aria-label="Ask RealityNG AI"
          className="flex-1"
          onBlur={() => setIsInputFocused(false)}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => setIsInputFocused(true)}
          placeholder="Ask how RealityNG works..."
          value={draft}
        />
        <Button disabled={!draft.trim()} type="submit">
          Ask
        </Button>
      </form>
    </Card>
  );
}
