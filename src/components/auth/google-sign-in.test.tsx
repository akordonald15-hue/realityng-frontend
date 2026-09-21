import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RealityAuthFlow } from "@/components/auth/reality-auth-flow";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    signIn: mocks.signIn,
    signUp: mocks.signUp,
    signInWithGoogle: mocks.signInWithGoogle,
  }),
  useOptionalAuth: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/auth/sign-in",
  useSearchParams: () => new URLSearchParams(),
}));

/** Captured GIS callback so tests can simulate Google returning a credential. */
let gisCallback: ((response: { credential: string }) => void) | null = null;

function installGoogleIdentity() {
  gisCallback = null;
  (window as unknown as { google?: unknown }).google = {
    accounts: {
      id: {
        initialize: (config: { callback: (r: { credential: string }) => void }) => {
          gisCallback = config.callback;
        },
        renderButton: (parent: HTMLElement) => {
          const button = document.createElement("button");
          button.textContent = "Continue with Google";
          parent.appendChild(button);
        },
        disableAutoSelect: vi.fn(),
      },
    },
  };
}

function removeGoogleIdentity() {
  delete (window as unknown as { google?: unknown }).google;
}

async function signalGoogleCredential(credential = "google-id-token") {
  await waitFor(() => expect(gisCallback).not.toBeNull());
  await act(async () => {
    gisCallback!({ credential });
  });
}

describe("Google sign-in", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com");
    installGoogleIdentity();
    mocks.signIn.mockReset();
    mocks.signUp.mockReset();
    mocks.push.mockReset();
    mocks.signInWithGoogle.mockReset();
    mocks.signInWithGoogle.mockResolvedValue({
      access: "a",
      refresh: "r",
      created: false,
      user: { id: "u1", email: "qa@gmail.com", roles: [] },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    removeGoogleIdentity();
  });

  it("offers Google on the sign-in flow", async () => {
    render(<RealityAuthFlow mode="sign-in" />);

    expect(await screen.findByTestId("google-sign-in")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
  });

  it("offers Google on the sign-up flow", async () => {
    render(<RealityAuthFlow mode="sign-up" />);

    expect(await screen.findByTestId("google-sign-in")).toBeInTheDocument();
  });

  it("does not bring back the old role chooser", async () => {
    render(<RealityAuthFlow mode="sign-in" />);
    await screen.findByTestId("google-sign-in");

    expect(screen.queryByText(/choose (your )?role/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /select .*role/i })).not.toBeInTheDocument();
  });

  it("exchanges the Google credential through the shared auth provider", async () => {
    render(<RealityAuthFlow mode="sign-in" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential("credential-from-google");

    await waitFor(() => expect(mocks.signInWithGoogle).toHaveBeenCalledTimes(1));
    expect(mocks.signInWithGoogle.mock.calls[0][0]).toBe("credential-from-google");
    // null keeps the provider from redirecting; this flow owns the destination
    expect(mocks.signInWithGoogle.mock.calls[0][1]).toBeNull();
  });

  it("resumes a protected action instead of redirecting", async () => {
    const onAuthenticated = vi.fn();
    render(<RealityAuthFlow mode="sign-in" onAuthenticated={onAuthenticated} />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledTimes(1));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("keeps a brand new customer on the ordinary buyer path", async () => {
    mocks.signInWithGoogle.mockResolvedValue({
      access: "a",
      refresh: "r",
      created: true,
      user: { id: "u2", email: "new@gmail.com", roles: [] },
    });
    render(<RealityAuthFlow mode="sign-in" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    // account age must not force professional role selection
    expect(mocks.push.mock.calls[0][0]).not.toContain("/onboarding/role-setup");
  });

  it("sends a professional journey into role onboarding", async () => {
    mocks.signInWithGoogle.mockResolvedValue({
      access: "a",
      refresh: "r",
      created: true,
      user: { id: "u3", email: "agent@gmail.com", roles: [] },
    });
    render(<RealityAuthFlow mode="sign-in" role="agent" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    const target = mocks.push.mock.calls[0][0] as string;
    expect(target).toContain("/onboarding/role-setup");
    expect(target).toContain("role=agent");
  });

  it("sends a returning professional into role onboarding too", async () => {
    render(<RealityAuthFlow mode="sign-in" role="landlord" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    expect(mocks.push.mock.calls[0][0]).toContain("role=landlord");
  });

  it("sends a returning customer to their normal destination", async () => {
    render(<RealityAuthFlow mode="sign-in" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledTimes(1));
    expect(mocks.push.mock.calls[0][0]).not.toContain("/onboarding/role-setup");
  });

  it("shows a readable message when the exchange fails", async () => {
    mocks.signInWithGoogle.mockRejectedValue(new Error("nope"));
    render(<RealityAuthFlow mode="sign-in" />);
    await screen.findByTestId("google-sign-in");

    await signalGoogleCredential();

    await waitFor(() => expect(mocks.signInWithGoogle).toHaveBeenCalled());
    expect(mocks.push).not.toHaveBeenCalled();
    // the modal must not be left stuck on a pending state
    expect(await screen.findByTestId("google-sign-in")).not.toHaveClass("pointer-events-none");
  });

  it("shows nothing at all when Google is not configured for the environment", async () => {
    removeGoogleIdentity();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");

    render(<RealityAuthFlow mode="sign-in" />);

    // An unconfigured provider must not advertise itself as broken, and the
    // "or" divider must not be left stranded above nothing.
    expect(screen.queryByTestId("google-sign-in")).not.toBeInTheDocument();
    expect(screen.queryByText(/Google sign-in is unavailable/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^or$/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("degrades to email and password when a configured Google fails to load", async () => {
    removeGoogleIdentity();
    // client ID present, but the GIS script never yields an API
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "configured.apps.googleusercontent.com");

    render(<RealityAuthFlow mode="sign-in" />);

    // simulate the GIS script failing to load (blocked, offline, CSP)
    await waitFor(() => expect(document.getElementById("realityng-google-identity")).not.toBeNull());
    await act(async () => {
      document.getElementById("realityng-google-identity")!.dispatchEvent(new Event("error"));
    });

    expect(await screen.findByText(/Google sign-in is unavailable/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });
});
