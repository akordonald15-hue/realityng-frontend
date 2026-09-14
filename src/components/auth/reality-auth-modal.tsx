"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { RealityAuthFlow } from "@/components/auth/reality-auth-flow";
import { useOptionalAuth } from "@/providers/auth-provider";

type RealityAuthMode = "sign-in" | "sign-up";

type RequireAuthOptions = {
  actionLabel?: string;
  mode?: RealityAuthMode;
  nextPath?: string;
  onAuthenticated?: () => void | Promise<void>;
  role?: string;
};

type RealityAuthModalContextValue = {
  requireAuth: (options?: RequireAuthOptions) => Promise<boolean>;
};

type PendingAuth = RequireAuthOptions & {
  resolve: (authenticated: boolean) => void;
  returnFocusTo: HTMLElement | null;
};

const RealityAuthModalContext = createContext<RealityAuthModalContextValue | null>(null);

export function RealityAuthModalProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const auth = useOptionalAuth();
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(
    (authenticated: boolean) => {
      pendingAuth?.resolve(authenticated);
      const focusTarget = pendingAuth?.returnFocusTo;
      setPendingAuth(null);
      window.setTimeout(() => focusTarget?.focus(), 0);
    },
    [pendingAuth],
  );

  const requireAuth = useCallback(
    async (options: RequireAuthOptions = {}) => {
      if (auth?.isAuthenticated) {
        await options.onAuthenticated?.();
        return true;
      }
      return new Promise<boolean>((resolve) => {
        setPendingAuth({
          ...options,
          mode: options.mode ?? "sign-in",
          resolve,
          returnFocusTo:
            typeof document !== "undefined"
              ? (document.activeElement as HTMLElement | null)
              : null,
        });
      });
    },
    [auth?.isAuthenticated],
  );

  useEffect(() => {
    if (!pendingAuth) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, pendingAuth]);

  return (
    <RealityAuthModalContext.Provider value={{ requireAuth }}>
      {children}
      {pendingAuth ? (
        <div
          aria-labelledby="reality-auth-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end bg-black/45 px-4 py-5 backdrop-blur-sm sm:items-center sm:justify-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal(false);
            }
          }}
          role="dialog"
        >
          <div
            className="w-full max-w-reality-form rounded-[32px] border border-reality-border-secondary bg-white px-6 py-8 text-reality-text-primary shadow-reality-lg sm:px-12 sm:py-12"
            ref={dialogRef}
          >
            <p className="sr-only" id="reality-auth-modal-title">
              {pendingAuth.actionLabel
                ? `Sign in to continue: ${pendingAuth.actionLabel}`
                : "Sign in to continue"}
            </p>
            <RealityAuthFlow
              mode={pendingAuth.mode}
              onAuthenticated={async () => {
                await pendingAuth.onAuthenticated?.();
                closeModal(true);
              }}
              onModeChange={() => undefined}
              redirectAfterSignIn={pendingAuth.nextPath ?? null}
              role={pendingAuth.role}
            />
          </div>
        </div>
      ) : null}
    </RealityAuthModalContext.Provider>
  );
}

export function useRealityAuthModal() {
  const context = useContext(RealityAuthModalContext);
  if (!context) {
    return {
      requireAuth: async (options?: RequireAuthOptions) => {
        await options?.onAuthenticated?.();
        return true;
      },
    };
  }
  return context;
}

