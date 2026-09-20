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
    ? "thinking"
    : isInputFocused || isOpen
      ? "listening"
      : showGreeting
        ? "thinking"
        : "idle";

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
          type="button"
        >
          <AssistantOrb state={orbState} size="launcher" />
          <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full bg-reality-surfaceDark px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-reality-sm backdrop-blur-md transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            Ask Reality AI
          </span>
          <span className="sr-only">RealityNG AI</span>
        </button>
      </div>
    );
  }

  return (
    <Card className="assistant-fade-scale assistant-glass-panel fixed bottom-4 left-4 right-4 z-50 flex max-h-[min(35rem,calc(100svh-2rem))] flex-col overflow-hidden rounded-2xl p-0 sm:left-auto sm:right-6 sm:w-[24rem]">
      <div className="flex items-start justify-between gap-3 border-b border-reality-border-secondary bg-reality-surfaceBrand px-4 py-3">
        <div className="flex items-center gap-3">
          <AssistantOrb state={orbState} size="sm" />
          <div>
            <h2 className="font-display text-lg font-semibold text-reality-text-primary">RealityNG AI</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-reality-brand-600">
              {helperText}
            </p>
          </div>
        </div>
        <button
          aria-label="Close RealityNG AI"
          className="flex h-10 w-10 items-center justify-center rounded-full text-reality-text-primary transition hover:bg-reality-surfaceMuted focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brandEmphasis"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-reality-canvas px-4 py-3">
        {messages.map((message) => (
          <div
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
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
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              className="rounded-xl border border-reality-border-primary bg-reality-surface px-3 py-1.5 text-xs font-semibold text-reality-brandEmphasis transition hover:bg-reality-surfaceBrand focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brandEmphasis"
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

