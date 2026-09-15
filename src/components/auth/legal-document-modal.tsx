"use client";

import { useEffect, useRef } from "react";

import { privacyPage, termsPage } from "@/lib/public-info-pages";

type LegalDocument = "terms" | "privacy";

export function LegalDocumentModal({
  document,
  onClose,
}: {
  document: LegalDocument;
  onClose: () => void;
}) {
  const content = document === "terms" ? termsPage : privacyPage;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = window.document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Keep keyboard events inside this nested dialog so Escape cannot close auth.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key === "Tab") {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button, [href]") ?? [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && window.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && window.document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-label={document === "terms" ? "Terms and Conditions" : "Privacy Notice"}
        aria-modal="true"
        className="flex max-h-[min(90vh,800px)] w-full max-w-3xl flex-col rounded-[28px] bg-white text-reality-text-primary shadow-reality-lg"
        data-legal-dialog
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-reality-border-secondary px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-reality-brand-600">
              {content.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">{content.title}</h2>
          </div>
          <button
            className="shrink-0 rounded-full border border-reality-border-primary px-4 py-2 text-sm font-semibold hover:bg-reality-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-reality-brand-500"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
        <div className="space-y-6 overflow-y-auto px-6 py-6 text-sm leading-7 text-reality-text-secondary sm:px-8">
          <p>{content.description}</p>
          <ul className="list-disc space-y-2 pl-5">
            {content.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
          {content.sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-display text-xl font-semibold text-reality-text-primary">{section.title}</h3>
              <p className="mt-2">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
