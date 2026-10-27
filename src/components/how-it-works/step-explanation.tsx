"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { ProtectedActionLink } from "@/components/auth/protected-action-link";
import { buttonClasses } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { useOptionalAuth } from "@/providers/auth-provider";

export type StepGuide = {
  explanation: string;
  action: string;
  href: string;
  protected?: boolean;
  artisanSignup?: boolean;
};

export function StepExplanation({
  title,
  guide,
  children,
  className,
  ...attributes
}: {
  title: string;
  guide: StepGuide;
  children: ReactNode;
  className: string;
  "data-feature"?: string;
  "data-step"?: string;
  "data-motion-child"?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const auth = useOptionalAuth();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const close = () => setOpen(false);
  const continueAction = () => {
    // Authentication must restore focus to a mounted trigger, not the closing dialog link.
    triggerRef.current?.focus();
    close();
  };
  const href =
    guide.artisanSignup && auth?.isAuthenticated
      ? "/onboarding/role-setup?role=artisan"
      : guide.href;
  const action =
    guide.artisanSignup && auth?.isAuthenticated ? "Continue artisan setup" : guide.action;

  return (
    <>
      <button
        ref={triggerRef}
        {...attributes}
        aria-label={title}
        aria-haspopup="dialog"
        className={className}
        onClick={() => setOpen(true)}
        type="button"
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <ModalShell
              className="max-h-[calc(100dvh-2rem)] overflow-y-auto [&_h2]:pr-12"
              description={guide.explanation}
              onClose={close}
              title={title}
            >
              {guide.protected ? (
                <ProtectedActionLink
                  actionLabel={guide.action.toLowerCase()}
                  className={buttonClasses("reality", "w-full whitespace-normal text-center")}
                  href={href}
                  onClick={continueAction}
                >
                  {action}
                </ProtectedActionLink>
              ) : (
                <Link
                  className={buttonClasses("reality", "w-full whitespace-normal text-center")}
                  href={href}
                  onClick={continueAction}
                >
                  {action}
                </Link>
              )}
            </ModalShell>
          </div>,
          document.body,
        )}
    </>
  );
}
