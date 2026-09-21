"use client";

import { useEffect, useRef, useState } from "react";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_ID = "realityng-google-identity";
/** Stop waiting if the GIS script is blocked or the network stalls. */
const LOAD_TIMEOUT_MS = 10_000;

type GoogleCredentialResponse = { credential?: string };

type GoogleAccountsId = {
  initialize: (config: Record<string, unknown>) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  disableAutoSelect: () => void;
};

/**
 * Read GIS off window without redeclaring the global `google` type, which the
 * Maps loader already owns.
 */
function googleIdentity(): GoogleAccountsId | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google
    ?.accounts?.id;
}

/** Clears GIS auto-selection on sign-out without touching the Google account. */
export function disableGoogleAutoSelect() {
  try {
    googleIdentity()?.disableAutoSelect();
  } catch {
    // Nothing to clear if the library never loaded.
  }
}

function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  return new Promise((resolve, reject) => {
    const giveUp = setTimeout(() => reject(new Error("unavailable")), LOAD_TIMEOUT_MS);
    const settle = <T,>(fn: (value: T) => void) => (value: T) => {
      clearTimeout(giveUp);
      fn(value);
    };
    resolve = settle(resolve);
    reject = settle(reject);

    if (typeof window === "undefined") {
      reject(new Error("unavailable"));
      return;
    }
    const ready = () => {
      const api = googleIdentity();
      if (api) {
        resolve(api);
      } else {
        reject(new Error("unavailable"));
      }
    };

    if (googleIdentity()) {
      ready();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", ready, { once: true });
      existing.addEventListener("error", () => reject(new Error("unavailable")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("unavailable"));
    document.head.appendChild(script);
  });
}

type GoogleSignInButtonProps = {
  /** Receives the Google ID token. Verification happens on the backend. */
  onCredential: (credential: string) => Promise<void> | void;
  /** Disables the control while an outer flow is busy. */
  disabled?: boolean;
  label?: string;
};

export function GoogleSignInButton({
  disabled = false,
  label = "Continue with Google",
  onCredential,
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const clientIdConfigured = clientId !== "";
  const target = useRef<HTMLDivElement>(null);
  const handler = useRef(onCredential);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "disabled">(
    // Nothing to show at all when the provider is not configured for this
    // environment; "unavailable" is reserved for a configured provider that
    // failed to load.
    clientIdConfigured ? "loading" : "disabled",
  );

  handler.current = onCredential;

  useEffect(() => {
    let cancelled = false;

    if (!clientIdConfigured) {
      return;
    }

    loadGoogleIdentity()
      .then((api) => {
        if (cancelled || !target.current) {
          return;
        }

        api.initialize({
          client_id: clientId,
          // Explicit button only - One Tap is deliberately not enabled.
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
          callback: (response: GoogleCredentialResponse) => {
            if (response?.credential) {
              void handler.current(response.credential);
            }
          },
        });

        target.current.innerHTML = "";
        api.renderButton(target.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 320,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, clientIdConfigured]);

  if (status === "disabled") {
    return null;
  }

  if (status === "unavailable") {
    return (
      <>
        <GoogleDivider />
        <p className="text-center text-xs leading-5 text-reality-text-tertiary" role="status">
          Google sign-in is unavailable right now. Use your email and password below.
        </p>
      </>
    );
  }

  return (
    <>
      <GoogleDivider />
      <div
      aria-busy={status === "loading"}
      className={disabled ? "pointer-events-none opacity-60" : undefined}
      data-testid="google-sign-in"
    >
      {status === "loading" ? (
        <p className="text-center text-xs leading-5 text-reality-text-tertiary">
          Loading Google sign-in...
        </p>
      ) : null}
      <div aria-label={label} className="flex justify-center" ref={target} />
      </div>
    </>
  );
}

function GoogleDivider() {
  return (
    <div aria-hidden="true" className="mt-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-reality-border-secondary" />
      <span className="text-xs font-medium text-reality-text-tertiary">or</span>
      <span className="h-px flex-1 bg-reality-border-secondary" />
    </div>
  );
}
